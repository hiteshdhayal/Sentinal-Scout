export const supabase = {
  log: async (table: string, data: any) => {
    console.log(`🗄️ Logging to Supabase [${table}]:`, data);
  }
};
