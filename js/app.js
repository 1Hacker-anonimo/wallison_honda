let siteData = null;

// ==========================================
// 1. INITIALIZATION & DATA FETCHING
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Determine loading state if necessary
    siteData = await SupabaseService.getPublicData();

    if (siteData) {
        initExperience(siteData);
    } else {
        console.error("Critical: Could not load site data.");
        // Optional: Render a "Retry" or "Maintenance" view
    }
});

function getData() { return siteData; }

function initExperience(data) {
    renderHeader(data.seller, data.site);
    renderCatalog(data.motorcycles);
}

// ==========================================
// 2. RENDERING CORE COMPONENTS
// ==========================================

function renderHeader(seller, site) {
    // Text Injection
    document.getElementById('seller-name').textContent = seller.name;
    document.getElementById('seller-bio').textContent = seller.bio;

    // Images
    document.getElementById('seller-pic').src = seller.profilePic;
    if (site.bannerImage) {
        document.getElementById('header-banner').style.backgroundImage = `url('${site.bannerImage}')`;
    }

    if (site.headerLogo) {
        document.getElementById('header-logo').src = site.headerLogo;
    } else {
        document.getElementById('header-logo').style.display = 'none';
    }

    // Social Actions
    const waLink = `https://wa.me/${seller.whatsapp}`;
    document.getElementById('btn-whatsapp-top').href = waLink;
    document.getElementById('btn-instagram-top').href = `https://instagram.com/${seller.instagram}`;
}

function renderCatalog(motos) {
    const grid = document.getElementById('moto-grid');
    grid.innerHTML = '';

    motos.sort((a, b) => a.order - b.order).forEach(moto => {
        const card = document.createElement('div');
        card.className = 'moto-card-neo'; // New Card Class

        const imgPath = fixImagePath(moto.mainImage);

        card.innerHTML = `
            <div class="card-image-box">
                <img src="${imgPath}" alt="${moto.name}">
            </div>
            <div class="card-content">
                <div>
                    <div class="card-cat">${moto.category}</div>
                    <h3 class="card-title">${moto.name}</h3>
                </div>
                
                <!-- Hover Actions Overlay -->
                <div class="card-actions-hover">
                    <button class="btn-cyber filled" style="width:100%" onclick="openDetails('${moto.id}')">
                        <i class="bi bi-eye"></i> Ver Detalhes
                    </button>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn-cyber" onclick="openConsortium('${moto.id}')">
                            <i class="bi bi-pie-chart"></i> Consórcio
                        </button>
                        <button class="btn-cyber" onclick="openFinancing('${moto.id}')">
                            <i class="bi bi-bank"></i> Financiar
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// 3. DRAWER SYSTEM (THE NEW MODAL)
// ==========================================

const drawerOverlay = document.getElementById('main-drawer');
const drawerTitle = document.getElementById('drawer-title');
const drawerBody = document.getElementById('drawer-body');
let slideshowInterval = null; // Store interval ID

window.closeDrawer = () => {
    if (slideshowInterval) clearInterval(slideshowInterval); // Stop slideshow
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Small timeout to clear content after animation
    setTimeout(() => {
        drawerBody.innerHTML = '';
    }, 300);
};

function openDrawer(title, contentHTML) {
    drawerTitle.innerHTML = title;
    drawerBody.innerHTML = contentHTML;
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close on overlay click
drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
});


// ==========================================
// 4. VIEW LOGIC (GENERATORS)
// ==========================================

window.openDetails = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (!moto) return;

    // Generate HTML for Details View
    let html = `
        <div class="gallery-hero">
            <img id="detail-main-img" src="${fixImagePath(moto.mainImage)}" alt="${moto.name}">
        </div>
        
        <div class="gallery-thumbs">
            <!-- Main thumb -->
            <img src="${fixImagePath(moto.mainImage)}" class="thumb active" onclick="swapImage(this, '${fixImagePath(moto.mainImage)}')">
            ${moto.gallery.map(img => `
                <img src="${fixImagePath(img)}" class="thumb" onclick="swapImage(this, '${fixImagePath(img)}')">
            `).join('')}
        </div>

        <div class="mt-4">
            <h4 class="font-display" style="color: var(--color-primary);">Descrição</h4>
            <div style="color: var(--color-text-muted); margin-top: 0.5rem; line-height: 1.6;">
                ${parseMarkdown(moto.description)}
            </div>
        </div>

        <div class="specs-grid">
             ${renderSpecs(moto.specs)}
        </div>

        <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
            <a href="https://wa.me/${getData().seller.whatsapp}?text=Tenho interesse na ${moto.name}" target="_blank" class="btn-cyber filled" style="text-align:center;">
                <i class="bi bi-whatsapp"></i> Negociar no WhatsApp
            </a>
            ${moto.video ? `
            <a href="${moto.video}" target="_blank" class="btn-cyber" style="text-align:center;">
                <i class="bi bi-play-circle"></i> Ver Vídeo Review
            </a>` : ''}
        </div>
    `;

    openDrawer(moto.name, html);

    // Start Auto Slideshow
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        const thumbs = document.querySelectorAll('.thumb');
        if (thumbs.length <= 1) return;

        let activeIndex = -1;
        thumbs.forEach((t, i) => {
            if (t.classList.contains('active')) activeIndex = i;
        });

        let nextIndex = (activeIndex + 1) % thumbs.length;
        thumbs[nextIndex].click(); // Simulate click to trigger swapImage
    }, 3000); // Change every 3 seconds
};

window.swapImage = (el, src) => {
    document.getElementById('detail-main-img').src = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
};

function renderSpecs(specsStr) {
    if (!specsStr) return '';
    return specsStr.split(/[;\n]/).map(line => {
        if (!line.trim()) return '';
        const parts = line.split(':');
        if (parts.length > 1) {
            return `<div class="spec-item"><b>${parts[0].trim()}</b> ${parts[1].trim()}</div>`;
        }
        return `<div class="spec-item" style="grid-column: span 2">${line}</div>`;
    }).join('');
}

window.openConsortium = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (!moto) return;

    let plansHtml = '';
    if (moto.consortium && moto.consortium.length > 0) {
        plansHtml = moto.consortium.map((plan, idx) => `
            <label class="plan-row-neo" style="display:flex; justify-content:space-between; padding: 1rem; background:rgba(255,255,255,0.05); margin-bottom:0.5rem; cursor:pointer; border:1px solid transparent;">
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <input type="radio" name="plan" value="${plan.installments}x de R$ ${plan.value}" ${idx === 0 ? 'checked' : ''}>
                    <span style="font-weight:bold; color: var(--color-primary);">${plan.installments}x</span>
                </div>
                <span>R$ ${plan.value}</span>
            </label>
        `).join('');
    }

    const html = `
        <div style="text-align:center; padding-bottom: 2rem;">
            <img src="${fixImagePath(moto.mainImage)}" style="width: 200px; height: auto;">
            <h2 style="font-size: 2rem; color: var(--color-primary); margin-top: 1rem;">R$ ${moto.consortiumCredit || moto.price}</h2>
            <p style="color: var(--color-text-muted);">Valor da Carta de Crédito</p>
        </div>

        <div style="margin-bottom: 2rem;">
            <h4 class="font-display">Planos Disponíveis</h4>
            <div style="margin-top: 1rem;">
                ${plansHtml}
            </div>
            <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">${moto.consortiumText || "* Valores sujeitos a alteração."}</p>
        </div>

        <button class="btn-cyber filled" style="width:100%" onclick="submitConsortium('${moto.name}')">
            <i class="bi bi-whatsapp"></i> Solicitar Consórcio
        </button>
        
        ${moto.transferEnabled ? `
        <button class="btn-cyber" style="width:100%; margin-top: 1rem;" onclick="openTransferForm('${moto.id}')">
            <i class="bi bi-arrow-repeat"></i> Ver Repasse de Consórcio
        </button>` : ''}
    `;

    openDrawer(`Consórcio: ${moto.name}`, html);
};

window.submitConsortium = (motoName) => {
    const selected = document.querySelector('input[name="plan"]:checked')?.value || "Não selecionado";
    const msg = `Olá! Quero simular o consórcio da *${motoName}*.\nPlano de interesse: ${selected}`;
    window.open(`https://wa.me/${getData().seller.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
};

window.openFinancing = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (!moto) return;

    const html = `
        <div style="margin-bottom: 2rem; color: var(--color-text-muted);">
            <p>${getData().site.financingBio || "Faça uma simulação de financiamento agora mesmo."}</p>
        </div>
        
        <form onsubmit="handleFinancingSubmit(event, '${moto.name}')">
            <div class="form-group-neo"><input type="text" id="fin-name" placeholder="Nome Completo" required></div>
            <div class="form-group-neo"><input type="text" id="fin-cpf" placeholder="CPF" required></div>
            <div class="form-group-neo"><input type="date" id="fin-birth" required></div>
            <div class="form-group-neo"><input type="tel" id="fin-phone" placeholder="WhatsApp" required></div>
            <div class="form-group-neo"><input type="number" id="fin-entry" placeholder="Valor de Entrada (R$)" required></div>
            <div class="form-group-neo">
                <select id="fin-license">
                    <option value="">Possui Habilitação?</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                </select>
            </div>
            
            <button type="submit" class="btn-cyber filled" style="width:100%">
                Solicitar Analise
            </button>
        </form>
    `;

    openDrawer(`Financiamento: ${moto.name}`, html);
};

window.handleFinancingSubmit = (e, motoName) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('fin-name').value,
        cpf: document.getElementById('fin-cpf').value,
        birth: document.getElementById('fin-birth').value,
        phone: document.getElementById('fin-phone').value,
        entry: document.getElementById('fin-entry').value,
        license: document.getElementById('fin-license').value
    };

    const msg = `*NOVA SIMULAÇÃO FINANCIAMENTO*\n\nMoto: ${motoName}\nCliente: ${data.name}\nCPF: ${data.cpf}\nNascimento: ${data.birth}\nEntrada: R$ ${data.entry}\nCNH: ${data.license}\nContato: ${data.phone}`;

    window.open(`https://wa.me/${getData().seller.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
};


window.openTransferForm = (id) => {
    const moto = getData().motorcycles.find(m => m.id == id);
    if (!moto) return;

    const html = `
        <div style="margin-bottom: 2rem; color: var(--color-text-muted);">
            <p>${moto.transferMessage || "Preencha seus dados para receber informações sobre o repasse deste consórcio."}</p>
        </div>
        
        <form onsubmit="handleTransferSubmit(event, '${moto.name}', '${moto.consortiumWhatsapp || ''}')">
            <div class="form-group-neo"><input type="text" id="trans-name" placeholder="Seu Nome" required></div>
            <div class="form-group-neo"><input type="tel" id="trans-phone" placeholder="Seu WhatsApp" required></div>
            
            <button type="submit" class="btn-cyber filled" style="width:100%">
                <i class="bi bi-whatsapp"></i> ${moto.transferButtonText || 'Falar com o vendedor'}
            </button>
        </form>
    `;

    openDrawer(`Repasse: ${moto.name}`, html);
};

window.handleTransferSubmit = (e, motoName, customWA) => {
    e.preventDefault();
    const name = document.getElementById('trans-name').value;
    const phone = document.getElementById('trans-phone').value;

    const waPhone = customWA || getData().seller.whatsapp;
    const msg = `Olá! Tenho interesse no *REPASSE DE CONSÓRCIO* da *${motoName}*.\n\n*Meus dados:*\nNome: ${name}\nWhatsApp: ${phone}`;

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    closeDrawer();
};

// ==========================================
// 5. UTILS & EFFECTS
// ==========================================

function setupEffects() {
    window.addEventListener('scroll', () => {
        const badge = document.querySelector('.seller-badge');
        if (badge) {
            const scroll = window.scrollY;
            if (scroll > 100) {
                badge.style.opacity = Math.max(0.1, 1 - (scroll - 100) / 300);
                badge.style.transform = `translateY(${scroll * 0.2}px)`;
            } else {
                badge.style.opacity = 1;
                badge.style.transform = `translateY(0)`;
            }
        }
    });
}
setupEffects();

function fixImagePath(path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) {
        return path;
    }
    return 'images/' + path;
}

function parseMarkdown(text) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

