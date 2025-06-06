export const databaseService = { initialize: async (config: any) => { console.log('Using mock database for development'); }, getContainer: () => null }; export default databaseService;
