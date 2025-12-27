let siteData = null;

// 1. UTILS & HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseMarkdown(text) {
    if (!text) return "";
    // Bold: **text** -> <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Helper to fix image paths
function fixImagePath(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
        return path;
    }
    return 'images/' + path;
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Show loading state if needed (optional)

    // 2. Fetch from Supabase
    siteData = await SupabaseService.getPublicData();

    if (siteData) {
        renderSeller(siteData.seller, siteData.site);
        renderMotorcycles(siteData.motorcycles);
        setupEventListeners();
        setupHeaderScroll();
    } else {
        console.error("Critical: Could not load site data.");
    }
});

function renderSeller(seller, site) {
    document.getElementById('seller-name').textContent = seller.name;
    document.getElementById('seller-bio').textContent = seller.bio;
    document.getElementById('seller-pic').src = seller.profilePic;

    if (site.bannerImage) {
        document.getElementById('header-banner').style.backgroundImage = `url('${site.bannerImage}')`;
    }

    if (site.headerLogo) {
        document.getElementById('header-logo').src = site.headerLogo;
    }

    const waLink = `https://wa.me/${seller.whatsapp}`;
    document.getElementById('btn-whatsapp-top').href = waLink;
    document.getElementById('btn-instagram-top').href = `https://instagram.com/${seller.instagram}`;
}

function renderMotorcycles(motos) {
    const grid = document.getElementById('moto-grid');
    grid.innerHTML = '';

    motos.sort((a, b) => a.order - b.order).forEach(moto => {
        const card = document.createElement('div');
        card.className = 'moto-card';

        const imgPath = fixImagePath(moto.mainImage);

        card.innerHTML = `
            <div class="moto-info">
                <h3>${moto.name}</h3>
                <p class="category">${moto.category}</p>
            </div>
            <img src="${imgPath}" alt="${moto.name}" class="moto-image">
            <div class="card-actions-standard">
                <button class="btn btn-primary w-100" onclick="showDetails('${moto.id}')">
                    <i class="bi bi-info-circle"></i> Detalhes da moto
                </button>
                <button class="btn btn-light-gray w-100" onclick="showConsortiumById('${moto.id}')">
                    <i class="bi bi-file-text"></i> Planos de consórcio
                </button>
                <button class="btn btn-light-gray w-100" onclick="showFinancingById('${moto.id}')">
                    <i class="bi bi-bank"></i> Financiamento
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.showConsortiumById = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (moto) showConsortium(moto);
};

window.showFinancingById = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (moto) showFinancing(moto);
};

window.showDetails = function (id) {
    const data = getData();
    const motos = data.motorcycles.sort((a, b) => a.order - b.order);
    const motoIndex = motos.findIndex(m => m.id == id);
    const moto = motos[motoIndex];
    if (!moto) return;

    // Header Info
    document.getElementById('modal-title').innerHTML = parseMarkdown(moto.name);

    // Description Formatting (Bold Titles)
    document.getElementById('modal-desc').innerHTML = parseMarkdown(moto.description);

    // Specs Formatting (Key: Value)
    const specsContainer = document.getElementById('modal-specs');
    specsContainer.innerHTML = '';
    if (moto.specs) {
        // Support both semicolon and newline as separators
        const specLines = moto.specs.split(/[;\n]/);
        specLines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split(':');
            if (parts.length > 1) {
                const item = document.createElement('div');
                item.className = 'spec-item';
                // Apply markdown to the value part
                item.innerHTML = `<b>${parts[0].trim()}:</b> ${parseMarkdown(parts[1].trim())}`;
                specsContainer.appendChild(item);
            } else {
                const item = document.createElement('div');
                item.className = 'spec-item';
                // Apply markdown to the whole line
                item.innerHTML = parseMarkdown(line.trim());
                specsContainer.appendChild(item);
            }
        });
    }

    // Main Image
    document.getElementById('modal-main-img').src = fixImagePath(moto.mainImage);

    // Gallery
    const thumbnails = document.getElementById('modal-thumbnails');
    thumbnails.innerHTML = '';

    // Add main image to gallery
    const mainThumb = document.createElement('img');
    mainThumb.src = fixImagePath(moto.mainImage);
    mainThumb.onclick = () => updateMainImg(fixImagePath(moto.mainImage), mainThumb);
    mainThumb.className = 'active';
    thumbnails.appendChild(mainThumb);

    moto.gallery.forEach(imgUrl => {
        const thumb = document.createElement('img');
        thumb.src = fixImagePath(imgUrl);
        thumb.onclick = () => updateMainImg(fixImagePath(imgUrl), thumb);
        thumbnails.appendChild(thumb);
    });

    // Video Button
    const btnVideo = document.getElementById('btn-modal-video');
    if (moto.video) {
        btnVideo.style.display = 'flex';
        btnVideo.href = moto.video;
    } else {
        btnVideo.style.display = 'none';
    }

    // Actions
    document.getElementById('btn-modal-whatsapp').href = `https://wa.me/${data.seller.whatsapp}?text=Olá! Tenho interesse na *${moto.name}*. Gostaria de mais informações.`;
    document.getElementById('btn-show-consortium').onclick = () => showConsortium(moto);
    document.getElementById('btn-modal-financing').onclick = () => showFinancing(moto);

    // Navigation (Next)
    const nextBtn = document.querySelector('.next-icon');
    nextBtn.onclick = () => {
        const nextIndex = (motoIndex + 1) % motos.length;
        showDetails(motos[nextIndex].id);
    };

    document.getElementById('product-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateMainImg(url, thumbEl) {
    document.getElementById('modal-main-img').src = url;
    document.querySelectorAll('.thumbnails img').forEach(img => img.classList.remove('active'));
    thumbEl.classList.add('active');
}

function showConsortium(moto) {
    const data = getData();
    const seller = data.seller;
    const site = data.site;
    const motos = data.motorcycles.sort((a, b) => a.order - b.order);
    const motoIndex = motos.findIndex(m => m.id === moto.id);

    // Profile Row
    document.getElementById('cons-seller-pic').src = seller.profilePic;
    document.getElementById('cons-seller-phone').textContent = seller.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    document.getElementById('cons-seller-insta').textContent = `@${seller.instagram}`;
    document.getElementById('cons-wa-circle').href = `https://wa.me/${seller.whatsapp}`;

    // Header simple
    document.getElementById('cons-moto-name').textContent = moto.name;

    // Image and Credit
    document.getElementById('cons-moto-img').src = fixImagePath(moto.mainImage);
    document.getElementById('cons-credit').textContent = moto.consortiumCredit || moto.price;
    document.getElementById('cons-info-text').textContent = moto.consortiumText || "*Os valores podem ser ajustados conforme tabela do consórcio.";

    // Render Plans
    const plansContainer = document.getElementById('consortium-plans');
    plansContainer.innerHTML = '';

    if (moto.consortium && moto.consortium.length > 0) {
        moto.consortium.forEach((plan, index) => {
            const row = document.createElement('label');
            row.className = 'plan-row';
            row.innerHTML = `
                <input type="radio" name="cons-plan-radio" value="${plan.installments}x de R$ ${plan.value}" ${index === 0 ? 'checked' : ''}>
                <span class="installments">${plan.installments}x</span>
                <span class="value">R$ ${plan.value}</span>
            `;
            plansContainer.appendChild(row);
        });
    }

    // Navigation (Next)
    const nextBtn = document.querySelector('.next-icon-consortium');
    nextBtn.onclick = () => {
        const nextIndex = (motoIndex + 1) % motos.length;
        showConsortium(motos[nextIndex]);
    };

    // Action Buttons
    document.getElementById('btn-consortium-wa-new').onclick = () => {
        const selected = document.querySelector('input[name="cons-plan-radio"]:checked')?.value || "";
        const msg = `Olá! Tenho interesse no consórcio da *${moto.name}*.\n*Crédito:* R$ ${moto.consortiumCredit || moto.price}\n*Plano:* ${selected}\n\nPode me ajudar?`;
        window.open(`https://wa.me/${seller.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const btnTransfer = document.getElementById('btn-show-transfer-new');
    if (moto.transferEnabled) {
        btnTransfer.style.display = 'flex';
        btnTransfer.onclick = () => showTransfer(moto);
    } else {
        btnTransfer.style.display = 'none';
    }

    document.getElementById('consortium-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showTransfer(moto) {
    const modal = document.getElementById('transfer-modal');
    const form = document.getElementById('transfer-form');

    // Reset form
    form.reset();
    document.getElementById('btn-transfer-submit').textContent = moto.transferButtonText || 'Falar com o vendedor';

    form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('transfer-name').value;
        const phone = document.getElementById('transfer-phone').value;

        if (moto.transferMandatoryFields) {
            if (!name || !phone) {
                alert('Por favor, preencha nome e telefone.');
                return;
            }
        }

        const waPhone = moto.consortiumWhatsapp || getData().seller.whatsapp;
        let msg = (moto.transferMessage || 'Olá, tenho interesse no repasse de consórcio para a {moto}').replace('{moto}', moto.name);

        if (name || phone) {
            msg += `\n\n*Meus dados:*\nNome: ${name}\nTelefone: ${phone}`;
        }

        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        modal.style.display = 'none';
    };

    modal.style.display = 'block';
}

function showFinancing(moto) {
    const data = getData();
    const seller = data.seller;
    const site = data.site;
    const motos = data.motorcycles.sort((a, b) => a.order - b.order);
    const motoIndex = motos.findIndex(m => m.id === moto.id);

    // Profile Row
    document.getElementById('fin-top-seller-pic').src = seller.profilePic;
    document.getElementById('fin-top-seller-phone').textContent = seller.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    document.getElementById('fin-top-seller-insta').textContent = `@${seller.instagram}`;
    document.getElementById('fin-top-wa-circle').href = `https://wa.me/${seller.whatsapp}`;

    // Header simple
    document.getElementById('fin-moto-title').textContent = moto.name;
    document.getElementById('fin-moto-name-hidden').value = moto.name;

    // Subtitle & How it works
    document.getElementById('fin-explanation').textContent = site.financingBio || "Preencha o formulário abaixo para que o vendedor possa trazer pra você as melhores cotações do mercado.";
    document.getElementById('fin-how-text').textContent = site.financingHowItWorks || "Entre em contato para saber mais.";

    // Navigation (Next)
    const nextBtn = document.querySelector('.next-icon-financing');
    nextBtn.onclick = () => {
        const nextIndex = (motoIndex + 1) % motos.length;
        showFinancing(motos[nextIndex]);
    };

    const form = document.getElementById('financing-form');
    form.reset();

    const btnHow = document.getElementById('btn-fin-how');
    const howBox = document.getElementById('fin-how-box');
    howBox.style.display = 'none';
    btnHow.onclick = () => {
        howBox.style.display = howBox.style.display === 'none' ? 'block' : 'none';
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const entry = document.getElementById('fin-entry').value;
        const birth = document.getElementById('fin-birth').value;
        const cpf = document.getElementById('fin-cpf').value;
        const name = document.getElementById('fin-name').value;
        const phone = document.getElementById('fin-phone').value;
        const license = document.getElementById('fin-driver-license').value;

        const waPhone = site.financingWhatsapp || seller.whatsapp;
        const msg = `*SOLICITAÇÃO DE FINANCIAMENTO*\n\n` +
            `*Moto:* ${moto.name}\n` +
            `*Valor de Entrada:* R$ ${entry}\n` +
            `*Data de Nascimento:* ${birth}\n` +
            `*CPF:* ${cpf}\n` +
            `*Cliente:* ${name}\n` +
            `*WhatsApp:* ${phone}\n` +
            `*Possui CNH:* ${license}\n\n` +
            `Gostaria de realizar uma simulação baseada nestes dados.`;

        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        document.getElementById('financing-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    document.getElementById('financing-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function setupEventListeners() {
    // Close Modals
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('product-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    document.querySelector('.close-consortium').onclick = () => {
        document.getElementById('consortium-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    document.querySelector('.close-transfer').onclick = () => {
        document.getElementById('transfer-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    document.querySelector('.close-financing').onclick = () => {
        document.getElementById('financing-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };
}

function setupHeaderScroll() {
    const header = document.getElementById('main-header');
    window.onscroll = () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
}
