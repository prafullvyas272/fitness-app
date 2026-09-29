import prisma from "../utils/prisma.js";
import RoleEnum from "../enums/RoleEnum.js";

const IST_OFFSET_MINUTES = 330; // Asia/Kolkata (+05:30)

const getMonthRangeUtc = (year, month) => {
  // month is 1-indexed
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

const getTodayIstRangeUtc = () => {
  const nowUtcMs = Date.now();
  const istMs = nowUtcMs + IST_OFFSET_MINUTES * 60 * 1000;
  const istDate = new Date(istMs);
  const y = istDate.getUTCFullYear();
  const m = istDate.getUTCMonth();
  const d = istDate.getUTCDate();

  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000;
  const endUtcMs = Date.UTC(y, m, d, 23, 59, 59, 999) - IST_OFFSET_MINUTES * 60 * 1000;
  return { start: new Date(startUtcMs), end: new Date(endUtcMs) };
};

const monthlyEquivalentPrice = (price, duration) => {
  switch (duration) {
    case "WEEKLY":
      return price * (52 / 12);
    case "QUARTERLY":
      return price / 3;
    case "YEARLY":
      return price / 12;
    case "MONTHLY":
    default:
      return price;
  }
};

const percentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
};

const monthLabel = (year, month) =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

/**
 * Sum of monthly-equivalent price for subscriptions that were ACTIVE at any point
 * during [start, end]. This is an estimate derived from current Subscription rows
 * (status + startDate/endDate) since no per-invoice payment amount is stored.
 */
const estimateMonthlyRevenue = async (start, end) => {
  const subs = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: end },
      // Mongo/Prisma: an unset optional field is not "null" for filtering purposes,
      // it needs isSet: false. { endDate: null } silently matches nothing here.
      OR: [{ endDate: { isSet: false } }, { endDate: { gte: start } }],
    },
    select: {
      plan: { select: { price: true, duration: true } },
    },
  });

  const total = subs.reduce(
    (sum, s) => sum + monthlyEquivalentPrice(s.plan.price, s.plan.duration),
    0
  );
  return Math.round(total);
};

export const getAdminDashboardStats = async (filter = {}) => {
  const now = new Date();
  const year = filter.year ? Number(filter.year) : now.getUTCFullYear();
  const month = filter.month ? Number(filter.month) : now.getUTCMonth() + 1;
  const limit = filter.limit ? Math.min(Math.max(Number(filter.limit), 1), 50) : 5;

  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    throw new Error("Invalid month/year filter");
  }

  const { start: thisMonthStart, end: thisMonthEnd } = getMonthRangeUtc(year, month);
  const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const prevYear = prevMonthDate.getUTCFullYear();
  const prevMonth = prevMonthDate.getUTCMonth() + 1;
  const { end: prevMonthEnd } = getMonthRangeUtc(prevYear, prevMonth);

  const [customerRole, trainerRole] = await Promise.all([
    prisma.role.findFirst({ where: { name: RoleEnum.CUSTOMER } }),
    prisma.role.findFirst({ where: { name: RoleEnum.TRAINER } }),
  ]);
  if (!customerRole || !trainerRole) {
    throw new Error("Required roles not found");
  }

  // --- Cards ---
  const [
    totalMembersNow,
    totalMembersPrev,
    activeMembersNow,
    activeMembersPrev,
    totalTrainersNow,
    totalTrainersPrev,
  ] = await Promise.all([
    prisma.user.count({ where: { roleId: customerRole.id, createdAt: { lte: thisMonthEnd } } }),
    prisma.user.count({ where: { roleId: customerRole.id, createdAt: { lte: prevMonthEnd } } }),
    prisma.user.count({ where: { roleId: customerRole.id, isActive: true, createdAt: { lte: thisMonthEnd } } }),
    prisma.user.count({ where: { roleId: customerRole.id, isActive: true, createdAt: { lte: prevMonthEnd } } }),
    prisma.user.count({ where: { roleId: trainerRole.id, createdAt: { lte: thisMonthEnd } } }),
    prisma.user.count({ where: { roleId: trainerRole.id, createdAt: { lte: prevMonthEnd } } }),
  ]);

  const monthlyRevenueValue = await estimateMonthlyRevenue(thisMonthStart, thisMonthEnd);
  const { start: prevMonthStart } = getMonthRangeUtc(prevYear, prevMonth);
  const prevMonthRevenueValue = await estimateMonthlyRevenue(prevMonthStart, prevMonthEnd);

  const cards = {
    totalMembers: {
      value: totalMembersNow,
      changePercent: percentChange(totalMembersNow, totalMembersPrev),
      trend: totalMembersNow >= totalMembersPrev ? "up" : "down",
    },
    activeMembers: {
      value: activeMembersNow,
      changePercent: percentChange(activeMembersNow, activeMembersPrev),
      trend: activeMembersNow >= activeMembersPrev ? "up" : "down",
    },
    totalTrainers: {
      value: totalTrainersNow,
      change: totalTrainersNow - totalTrainersPrev,
      trend: totalTrainersNow >= totalTrainersPrev ? "up" : "down",
    },
    monthlyRevenue: {
      value: monthlyRevenueValue,
      changePercent: percentChange(monthlyRevenueValue, prevMonthRevenueValue),
      trend: monthlyRevenueValue >= prevMonthRevenueValue ? "up" : "down",
      currency: "USD",
    },
  };

  // --- Revenue chart: last 6 months ending at the requested month ---
  const chartMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - 1 - i, 1));
    chartMonths.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  const revenueSeries = await Promise.all(
    chartMonths.map(({ year: y, month: m }) => {
      const { start, end } = getMonthRangeUtc(y, m);
      return estimateMonthlyRevenue(start, end);
    })
  );
  const revenueChart = {
    categories: chartMonths.map(({ year: y, month: m }) => monthLabel(y, m)),
    series: revenueSeries,
  };

  // --- Membership split ---
  // Grouped by each customer's most recent Subscription: ACTIVE -> plan name,
  // CANCELLED/PAST_DUE -> "Expired", none -> "No Active Plan".
  const allCustomers = await prisma.user.findMany({
    where: { roleId: customerRole.id },
    select: { id: true },
  });
  const customerIds = allCustomers.map((c) => c.id);

  const latestSubs = await prisma.subscription.findMany({
    where: { userId: { in: customerIds } },
    orderBy: { startDate: "desc" },
    select: { userId: true, status: true, plan: { select: { name: true } } },
  });
  const latestSubByUser = new Map();
  for (const sub of latestSubs) {
    if (!latestSubByUser.has(sub.userId)) latestSubByUser.set(sub.userId, sub);
  }

  const splitCounts = new Map();
  const bump = (label) => splitCounts.set(label, (splitCounts.get(label) || 0) + 1);
  for (const id of customerIds) {
    const sub = latestSubByUser.get(id);
    if (!sub) {
      bump("No Active Plan");
    } else if (sub.status === "ACTIVE") {
      bump(sub.plan.name);
    } else {
      bump("Expired");
    }
  }
  const membershipSplit = {
    total: customerIds.length,
    breakdown: Array.from(splitCounts.entries()).map(([label, count]) => ({ label, count })),
  };

  // --- Recent members ---
  const recentCustomers = await prisma.user.findMany({
    where: { roleId: customerRole.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, firstName: true, lastName: true, createdAt: true, isActive: true },
  });
  const recentMembers = recentCustomers.map((c) => {
    const sub = latestSubByUser.get(c.id);
    return {
      id: c.id,
      name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
      plan: sub && sub.status === "ACTIVE" ? sub.plan.name : null,
      enrolledAt: c.createdAt.toISOString().slice(0, 10),
      isActive: c.isActive,
    };
  });

  const totalRevenue = {
    value: monthlyRevenueValue,
    currency: "USD",
    changePercent: percentChange(monthlyRevenueValue, prevMonthRevenueValue),
    label: "this month",
  };

  // --- Quick stats ---
  const { start: todayStart, end: todayEnd } = getTodayIstRangeUtc();
  const [sessionsToday, pendingRequests] = await Promise.all([
    prisma.trainerBooking.count({
      where: {
        bookingStatus: { not: "CANCELLED" },
        timeSlot: { startTime: { gte: todayStart, lte: todayEnd } },
      },
    }),
    prisma.trainerRequest.count({ where: { status: "PENDING" } }),
  ]);

  return {
    cards,
    revenueChart,
    membershipSplit,
    recentMembers,
    totalRevenue,
    quickStats: { sessionsToday, pendingRequests },
  };
};
