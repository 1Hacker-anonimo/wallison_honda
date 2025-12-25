/**
 * SUPABASE SERVICE - Public Side
 */

const SupabaseService = {
    /**
     * Fetch all data needed for the public site in a single "simulation" of the initialData structure
     */
    async getPublicData() {
        try {
            // 1. Fetch Seller & Site Config
            const { data: perfil, error: perfilError } = await supabase
                .from('perfil_vendedor')
                .select('*')
                .single();

            if (perfilError) throw perfilError;

            // 2. Fetch Motorcycles (Active only)
            const { data: motos, error: motosError } = await supabase
                .from('motos')
                .select('*')
                .eq('ativo', true)
                .order('order', { ascending: true });

            if (motosError) throw motosError;

            // 3. For each moto, fetch consortium plans
            // (In a real app, you might join or do a single query, but let's keep it readable)
            const motorcyclesWithPlans = await Promise.all(motos.map(async (m) => {
                const { data: consorcio } = await supabase
                    .from('consorcios')
                    .select('*, planos_consorcio(*)')
                    .eq('moto_id', m.id)
                    .single();

                return {
                    id: m.id,
                    name: m.nome,
                    category: m.categoria,
                    price: m.preco,
                    mainImage: m.imagem_url,
                    gallery: m.galeria || [],
                    video: m.video_url,
                    description: m.descricao,
                    specs: m.specs,
                    consortiumEnabled: consorcio ? consorcio.enabled : false,
                    consortiumCredit: consorcio ? consorcio.credito : m.preco,
                    consortiumText: consorcio ? consorcio.texto_info : "",
                    consortiumWhatsapp: consorcio ? consorcio.whatsapp_especifico : "",
                    consortium: consorcio ? consorcio.planos_consorcio.map(p => ({
                        installments: p.parcelas,
                        value: p.valor
                    })) : [],
                    transferEnabled: m.transfer_enabled,
                    transferMessage: m.transfer_message,
                    transferButtonText: m.transfer_button_text,
                    transferMandatoryFields: m.transfer_mandatory_fields,
                    order: m.order
                };
            }));

            return {
                seller: {
                    name: perfil.nome,
                    profilePic: perfil.foto_url,
                    bio: perfil.descricao,
                    whatsapp: perfil.whatsapp,
                    instagram: perfil.instagram,
                    youtube: perfil.youtube
                },
                site: {
                    bannerImage: perfil.banner_image_url,
                    headerLogo: perfil.header_logo_url,
                    financingTitle: perfil.financing_title,
                    financingBio: perfil.financing_bio,
                    financingHowItWorks: perfil.financing_how_it_works,
                    financingWhatsapp: perfil.financing_whatsapp
                },
                motorcycles: motorcyclesWithPlans
            };
        } catch (error) {
            console.error("Error fetching data from Supabase:", error);
            // Fallback to initial local data if defined or return null
            return typeof initialData !== 'undefined' ? initialData : null;
        }
    }
};
