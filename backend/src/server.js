const app = require("./app");
const env = require("./config/env");

const { startCronJobs } = require("./jobs");

const PORT = env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

    if (env.NODE_ENV === "development") {
        startCronJobs();
        console.log("Development warranty scheduler started with node-cron.");
    } else {
        console.log("Production warranty scheduler delegated to Vercel Cron.");
    }

});
