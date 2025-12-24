const initialData = {
    seller: {
        name: "Jonnathan Holanda",
        profilePic: "images/profile_placeholder.jpg",
        bio: "Conectando você à sua próxima moto com as melhores condições!",
        whatsapp: "5585997499223",
        instagram: "jonnathanhonda",
        youtube: ""
    },
    site: {
        bannerImage: "images/banner_placeholder.jpg",
        headerLogo: "images/honda_logo.png",
        financingTitle: "Simulação de Financiamento",
        financingBio: "Realize o sonho da sua Honda zero com as melhores taxas do mercado. Faça sua simulação agora!",
        financingHowItWorks: "O processo é simples: preencha seus dados, nossa equipe analisa seu perfil junto ao Banco Honda e retorna com o resultado em poucos minutos. Entrada facilitada e parcelas que cabem no seu bolso.",
        financingWhatsapp: ""
    },
    motorcycles: [
        {
            id: 1,
            name: "POP 110i ES",
            category: "Street",
            price: "11.350,00",
            mainImage: "images/P1hYco3y0YdIwwxRT2gdfn8uApIL8UEvsvu0c5JL.webp",
            gallery: [
                "images/GVr8KjiSavvvlDj52JkPZQbvsOTtuc5OmfyboiZa.webp",
                "images/xvNhD3VeMAflZbJRi8rJfIvaIx1OBp41Yzt97rJI.webp",
                "images/6pWmlhlmiEAnYgpWtk9MFN8TVsxEEvP4qdvCZdVu.webp"
            ],
            video: "https://www.youtube.com/embed/fPz3QRJ7XH4",
            description: "Partida elétrica agilidade. O botão de partida elétrica traz ainda mais praticidade, conforto e comodidade para o dia a dia com a nova Pop. Transmissão semiautomática praticidade. Novo conjunto, com câmbio semiautomático e rotativo de 4 marchas. Dispensa a utilização do manete de embreagem e torna a pilotagem ainda mais fácil e confortável.",
            specs: "Tipo: OHC, Monocilíndrico, 4 tempos, arrefecido a ar; Cilindrada: 109,5 cc; Potência Máxima: 8,43 cv a 7.250 rpm; Torque Máximo: 0,945 kgf.m a 5.000 rpm; Transmissão: 4 velocidades; Sistema de Partida: Elétrica; Diâmetro x Curso: 47,0 x 63,1 mm; Relação de Compressão: 10,0 : 1; Sistema de Alimentação: Injeção Eletrônica PGM-FI; Combustível: Gasolina; Capacidade: 4,2 Litros; Óleo do Motor: 1,0 Litros",
            consortium: [
                { installments: 80, value: "188,70" },
                { installments: 60, value: "244,40" },
                { installments: 48, value: "301,04" },
                { installments: 36, value: "396,60" },
                { installments: 24, value: "583,34" },
                { installments: 18, value: "773,28" },
                { installments: 12, value: "1.153,17" }
            ],
            consortiumEnabled: true,
            consortiumCredit: "11.350,00",
            consortiumText: "* Valores sujeitos a alteração conforme tabela da fábrica.",
            consortiumWhatsapp: "",
            transferEnabled: true,
            transferMessage: "Olá, tenho interesse no repasse de consórcio para a moto {moto}. Por favor, me envie mais informações.",
            transferMandatoryFields: true,
            transferButtonText: "Falar com o vendedor",
            order: 1
        },
        {
            id: 2,
            name: "BIZ 125 ES",
            category: "Street",
            price: "14.500,00",
            mainImage: "images/qsyMUlvqcFgT7xyedwhmvlBQkJBclAbvONinRJtU.png",
            gallery: [],
            video: "",
            description: "Praticidade e economia para o seu dia a dia.",
            specs: "Cilindrada: 125cc",
            consortium: [],
            consortiumEnabled: false,
            consortiumCredit: "14.500,00",
            consortiumText: "* Valores sujeitos a alteração conforme tabela da fábrica.",
            consortiumWhatsapp: "",
            transferEnabled: false,
            transferMessage: "Olá, tenho interesse no repasse de consórcio para a moto {moto}. Por favor, me envie mais informações.",
            transferMandatoryFields: true,
            transferButtonText: "Falar com o vendedor",
            order: 2
        }
    ]
};

// Function to initialize data in LocalStorage if not already present
function initPersistence() {
    if (!localStorage.getItem('honda_site_data')) {
        localStorage.setItem('honda_site_data', JSON.stringify(initialData));
    }
}

function getData() {
    initPersistence();
    return JSON.parse(localStorage.getItem('honda_site_data'));
}

function saveData(data) {
    localStorage.setItem('honda_site_data', JSON.stringify(data));
}
