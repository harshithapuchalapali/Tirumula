const sb = window.supabase.createClient(
  'https://wwsctdtyohiqabwtbmhn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3c2N0ZHR5b2hpcWFid3RibWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTYxMzEsImV4cCI6MjA5NzYzMjEzMX0.qwNRfFm4H_wocKQyz2yo5csRAXLNcPwmFZNRBLg-UT0'
);

const ProductRepo = {
  async getAll() {
    const { data, error } = await sb.from('products').select('*').order('id', { ascending: true });
    if (error) throw error;
    return (data || []).map(Product.fromSupabase);
  },

  async getById(id) {
    const { data, error } = await sb.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data ? Product.fromSupabase(data) : null;
  },

  async create(productData) {
    const { data, error } = await sb.from('products').insert([productData]).select();
    if (error) throw error;
    return data?.[0] ? Product.fromSupabase(data[0]) : null;
  },

  async update(id, productData) {
    const { data, error } = await sb.from('products').update(productData).eq('id', id).select();
    if (error) throw error;
    return data?.[0] ? Product.fromSupabase(data[0]) : null;
  },

  async remove(id) {
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};
