import { CosmosClient } from "@azure/cosmos";
import { env } from "./config/environment";

const client = new CosmosClient(env.COSMOSDB_CONNECTION_STRING_CENTRALUS || "");

export const testDatabaseConnection = async () => {
  try {
    const { database } = await client.databases.createIfNotExists({ id: "Careerate" });
    console.log(`✅ Cosmos DB database "${database.id}" is ready.`);
    
    // You can also create a container here if needed
    // const { container } = await database.containers.createIfNotExists({ id: "items" });
    // console.log(`✅ Container "${container.id}" is ready.`);

  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};

export const db = client.database("Careerate");
