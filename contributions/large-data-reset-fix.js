// Fix for issue #3698: Cannot reset large data
// File: src/queries/prisma/website.ts

// Replace the broken deleteMany implementation (around line 140):
/*
// For large datasets, we need to delete data in chunks to avoid transaction timeouts
// We'll delete data in batches of 10000 records at a time
const deleteInBatches = async (model: any, where: any) => {
  let deletedCount;
  do {
    // First, find records to delete (up to 10000)
    const recordsToDelete = await model.findMany({
      where,
      take: 10000,
      select: {
        id: true,
      },
    });
    
    if (recordsToDelete.length === 0) {
      deletedCount = 0;
      break;
    }
    
    // Then delete those records by their IDs
    const result = await model.deleteMany({
      where: {
        id: {
          in: recordsToDelete.map((record: any) => record.id),
        },
      },
    });
    
    deletedCount = result.count;
  } while (deletedCount > 0);
};

// Delete data in batches to avoid transaction timeouts
await deleteInBatches(client.eventData, { websiteId });
await deleteInBatches(client.sessionData, { websiteId });
await deleteInBatches(client.websiteEvent, { websiteId });
await deleteInBatches(client.session, { websiteId });
*/