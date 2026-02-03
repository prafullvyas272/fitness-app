import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Only run app.listen if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Crucial: Vercel needs the exported app to handle the request
export default app;