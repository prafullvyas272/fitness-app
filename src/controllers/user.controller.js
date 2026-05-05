import { getAllTrainers, getAllCustomers, assignCustomer, toggleUserIsActive, unassignCustomer } from "../services/user.service.js";
import prisma from "../utils/prisma.js";

/**
 * Get all trainers
 */
export const getAllTrainersHandler = async (req, res) => {
    try {
        const authUserId = req.user.userId;

        const trainers = await getAllTrainers(authUserId);

        
        console.log(trainers)
        const formattedTrainers = trainers.map(
            ({ assignedCustomersAsTrainer, userProfileDetails, plan, ...trainer }) => ({
                ...trainer,
                assignedCustomers: assignedCustomersAsTrainer,
                userProfileDetails: Array.isArray(userProfileDetails) && userProfileDetails.length > 0 ? userProfileDetails[0] : null,

                plan: plan
                ? {
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    }
                : null
            })
        );
        res.status(200).json({
            success: true,
            message: 'Trainers list fetched sucessfully.',
            data: formattedTrainers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};



/**
 * Get all customers
 */
export const getAllCustomersHandler = async (req, res) => {
    try {
        const customers = await getAllCustomers(req.user);

        const formattedCustomers = customers.map(
            ({ assignedCustomersAsCustomer, ...customer }) => ({
            ...customer,
            assignedTrainers: assignedCustomersAsCustomer
            
            })
        );
        res.status(200).json({
            success: true,
            message: 'Customers list fetched sucessfully.',
            data: formattedCustomers,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


/**
 * Assign a customer to a trainer
 */
export const assignCustomerHandler = async (req, res) => {
    try {
        const { trainerId, customerId } = req.body;

        const assignment = await assignCustomer(trainerId, customerId);

        res.status(200).json({
            success: true,
            message: "Customer successfully assigned to trainer.",
            data: assignment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


/**
 * Toggle the isActive status for a user.
 */
export const toggleUserIsActiveHandler = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        const updatedUser = await toggleUserIsActive(userId, isActive);

        res.status(200).json({
            success: true,
            message: "User isActive status updated successfully.",
            data: updatedUser
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


/**
 * Unassign a customer from a trainer.
 */
export const unassignCustomerHandler = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { trainerId } = req.body;

        const deletedAssignment = await unassignCustomer(trainerId, customerId);

        res.status(200).json({
            success: true,
            message: "Customer successfully unassigned from trainer.",
            data: deletedAssignment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

export const getCustomersSubscriptionsHandler = async (req, res) => {
    try {
        const { status, page = 1, pageSize = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(pageSize);

        const customerRole = await prisma.role.findUnique({ where: { name: "Customer" }, select: { id: true } });
        if (!customerRole) return res.status(500).json({ error: "Customer role not found" });

        const where = { roleId: customerRole.id };

        const [total, customers] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: Number(pageSize),
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    isPremiumMember: true,
                    createdAt: true,
                    subscriptions: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            status: true,
                            startDate: true,
                            endDate: true,
                            plan: { select: { id: true, name: true, price: true } },
                        },
                    },
                },
            }),
        ]);

        let data = customers.map((c) => ({
            ...c,
            subscription: c.subscriptions?.[0] || null,
            subscriptions: undefined,
        }));

        if (status) {
            const s = status.toUpperCase();
            data = data.filter((c) =>
                s === "NONE"
                    ? !c.subscription
                    : c.subscription?.status === s
            );
        }

        res.json({
            success: true,
            data,
            pagination: {
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(total / Number(pageSize)),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCustomerSubscriptionByIdHandler = async (req, res) => {
    try {
        const { id: customerId } = req.params;

        const [customer, assignedTrainer] = await Promise.all([
            prisma.user.findUnique({
                where: { id: customerId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    isPremiumMember: true,
                    createdAt: true,
                    subscriptions: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            status: true,
                            startDate: true,
                            endDate: true,
                            plan: { select: { id: true, name: true, price: true } },
                        },
                    },
                },
            }),
            prisma.assignedCustomer.findFirst({
                where: { customerId, isActive: true },
                include: {
                    trainer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            plan: {
                                select: { id: true, name: true, price: true, features: true, description: true },
                            },
                        },
                    },
                },
            }),
        ]);

        if (!customer) return res.status(404).json({ error: "Customer not found" });

        const subscription = customer.subscriptions?.[0] || null;
        const trainerPlan = assignedTrainer?.trainer?.plan || null;
        const hasActiveSubscription = subscription?.status === "ACTIVE";

        res.json({
            success: true,
            data: {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                isActive: customer.isActive,
                isPremiumMember: customer.isPremiumMember,
                createdAt: customer.createdAt,
                subscription,
                assignedTrainer: assignedTrainer ? {
                    id: assignedTrainer.trainer.id,
                    firstName: assignedTrainer.trainer.firstName,
                    lastName: assignedTrainer.trainer.lastName,
                    email: assignedTrainer.trainer.email,
                    plan: trainerPlan,
                } : null,
                canActivate: !!trainerPlan && !hasActiveSubscription,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const adminActivatePlanHandler = async (req, res) => {
    try {
        const { id: customerId } = req.params;
        const { planId } = req.body;

        if (!planId) return res.status(400).json({ error: "planId is required" });

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        const customer = await prisma.user.findUnique({ where: { id: customerId }, select: { id: true } });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        // Cancel any existing active subscription first
        await prisma.subscription.updateMany({
            where: { userId: customerId, status: "ACTIVE" },
            data: { status: "CANCELLED", endDate: new Date() },
        });

        const subscription = await prisma.subscription.create({
            data: { userId: customerId, planId, status: "ACTIVE" },
            include: { plan: { select: { id: true, name: true, price: true } } },
        });

        await prisma.user.update({ where: { id: customerId }, data: { isPremiumMember: true } });

        res.status(201).json({ success: true, message: "Plan activated successfully", data: subscription });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
