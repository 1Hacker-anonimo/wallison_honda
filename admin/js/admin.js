// Get Supabase client from global config
const getSupabase = () => window.supabase;
let currentMotoId = null;
let currentGallery = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin Dashboard Loading...");

    // 1. Initial UI Setup (RUN THIS FIRST - No dependencies)
    setupTabSwitching();

    // 2. Wait for Supabase to be ready (Max 2 seconds)
    let retryCount = 0;
    while (!window.supabase && retryCount < 40) {
        await new Promise(r => setTimeout(r, 50));
        retryCount++;
    }

    const supabase = getSupabase();
    if (!supabase) {
        console.error("Supabase client not initialized.");
        alert("Erro técnico: O sistema de banco de dados não carregou. Tente atualizar a página.");
        return;
    }

    try {
        // 3. Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/admin/index.html';
            return;
        }

        // 4. Other Setup
        setupAdminActions();
        setupConsortiumActions();

        // 5. Data Load
        await refreshData();
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

let cachedData = null;

async function refreshData() {
    const supabase = getSupabase();
    try {
        cachedData = await fetchAllData();

        if (cachedData.perfil) {
            loadSellerForm(cachedData);
            loadFinancingForm(cachedData);
        }

        loadMotoList(cachedData.motorcycles || []);
        loadConsortiumList(cachedData.motorcycles || []);
    } catch (err) {
        console.error("Error refreshing data:", err);
    }
}

async function fetchAllData() {
    const supabase = getSupabase();
    // Simple fetcher for admin
    const { data: perfil } = await supabase.from('perfil_vendedor').select('*').single();
    const { data: motos } = await supabase.from('motos').select('*').order('order', { ascending: true });

    const motorcyclesWithDetails = await Promise.all(motos.map(async (m) => {
        const { data: consorcio } = await supabase
            .from('consorcios')
            .select('*, planos_consorcio(*)')
            .eq('moto_id', m.id)
            .single();
        return { ...m, consorcio };
    }));

    return { perfil, motorcycles: motorcyclesWithDetails };
}

function loadSellerForm(data) {
    const p = data.perfil;
    document.getElementById('edit-name').value = p.nome || '';
    document.getElementById('edit-pic').value = p.foto_url || '';
    document.getElementById('edit-bio').value = p.descricao || '';
    document.getElementById('edit-whatsapp').value = p.whatsapp || '';
    document.getElementById('edit-instagram').value = p.instagram || '';
    document.getElementById('edit-banner').value = p.banner_image_url || '';
    document.getElementById('edit-logo').value = p.header_logo_url || '';

    // Checkbox (Default to true if undefined)
    const logoActive = p.header_logo_enabled !== false;
    document.getElementById('check-logo-active').checked = logoActive;
}



function loadFinancingForm(data) {
    const p = data.perfil;
    document.getElementById('edit-fin-title').value = p.financing_title || '';
    document.getElementById('edit-fin-bio').value = p.financing_bio || '';
    document.getElementById('edit-fin-how').value = p.financing_how_it_works || '';
    document.getElementById('edit-fin-wa').value = p.financing_whatsapp || '';
}

function loadMotoList(motos) {
    const list = document.getElementById('moto-list');
    list.innerHTML = '';
    motos.forEach(moto => {
        const item = document.createElement('div');
        item.className = 'moto-item';
        item.innerHTML = `
            <img src="${moto.imagem_url}" alt="">
            <div class="moto-item-info">
                <strong>${moto.nome}</strong><br>
                <small>${moto.categoria} - R$ ${moto.preco}</small>
            </div>
            <div class="moto-item-actions">
                <button class="btn btn-outline" onclick="editMoto('${moto.id}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline btn-danger" onclick="deleteMoto('${moto.id}')"><i class="bi bi-trash"></i></button>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadConsortiumList(motos) {
    const list = document.getElementById('consortium-moto-list');
    list.innerHTML = '';
    motos.forEach(moto => {
        const hasCons = moto.consorcio && moto.consorcio.enabled;
        const item = document.createElement('div');
        item.className = 'moto-item';
        item.innerHTML = `
            <img src="${moto.imagem_url}" alt="">
            <div class="moto-item-info">
                <strong>${moto.nome}</strong><br>
                <small>${hasCons ? '<span style="color: green">Ativo</span>' : '<span style="color: gray">Inativo</span>'}</small>
            </div>
            <div class="moto-item-actions">
                <button class="btn btn-primary btn-sm" onclick="configureConsortium('${moto.id}')">Configurar</button>
            </div>
        `;
        list.appendChild(item);
    });
}

/** 
 * IMAGE UPLOAD HELPER 
 */
async function handleUpload(fileInputId, urlInputId, bucket) {
    const supabase = getSupabase();
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput.files || fileInput.files.length === 0) return null;

    const file = fileInput.files[0];
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) {
        alert("Erro no upload: " + error.message);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    document.getElementById(urlInputId).value = publicUrl;
    return publicUrl;
}

// Gallery Upload Handler
async function handleGalleryUpload(files) {
    const supabase = getSupabase();
    const uploadedUrls = [];
    for (const file of files) {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data, error } = await supabase.storage
            .from('moto_images')
            .upload(fileName, file);

        if (error) {
            console.error("Gallery upload error:", error);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('moto_images')
            .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
}

function renderGalleryAdmin() {
    const container = document.getElementById('moto-gallery-preview');
    if (!container) return;
    container.innerHTML = '';

    currentGallery.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item-admin';
        item.innerHTML = `
            <img src="${url}" alt="Gallery ${index}">
            <button type="button" class="btn-remove-img" onclick="removeGalleryImage(${index})">
                <i class="bi bi-x"></i>
            </button>
        `;
        container.appendChild(item);
    });
}

window.removeGalleryImage = (index) => {
    currentGallery.splice(index, 1);
    renderGalleryAdmin();
};

window.formatText = (id, type) => {
    const el = document.getElementById(id);
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);

    if (type === 'bold') {
        const replacement = `**${selected}**`;
        el.value = text.substring(0, start) + replacement + text.substring(end);
        el.selectionStart = el.selectionEnd = start + replacement.length;
    }
    el.focus();
};

function setupAdminActions() {
    const supabase = getSupabase();
    // Seller + Banner unified save (or separate)
    const sellerForm = document.getElementById('seller-form');
    if (sellerForm) sellerForm.onsubmit = async (e) => {
        e.preventDefault();

        // Upload is handled by Dropzone immediately. 
        // URL is already in the hidden input.

        const updates = {
            id: 1, // ID is required for upsert
            nome: document.getElementById('edit-name').value,
            foto_url: document.getElementById('edit-pic').value,
            descricao: document.getElementById('edit-bio').value,
            whatsapp: document.getElementById('edit-whatsapp').value,
            instagram: document.getElementById('edit-instagram').value,
            updated_at: new Date()
        };

        const { error } = await supabase.from('perfil_vendedor').upsert(updates);
        if (error) alert("Erro: " + error.message);
        else alert("Dados salvos!");
    };

    const siteForm = document.getElementById('site-form');
    if (siteForm) siteForm.onsubmit = async (e) => {
        e.preventDefault();

        // Upload is handled by Dropzone immediately.

        const updates = {
            id: 1,
            nome: document.getElementById('edit-name').value || 'Vendedor', // Ensure name is never null
            banner_image_url: document.getElementById('edit-banner').value,
            header_logo_url: document.getElementById('edit-logo').value,
            header_logo_enabled: document.getElementById('check-logo-active').checked,
            updated_at: new Date()
        };

        const { error } = await supabase.from('perfil_vendedor').upsert(updates);
        if (error) alert("Erro: " + error.message);
        else alert("Configurações atualizadas!");
    };

    const finForm = document.getElementById('financing-config-form');
    if (finForm) finForm.onsubmit = async (e) => {
        e.preventDefault();
        const updates = {
            id: 1,
            nome: document.getElementById('edit-name').value || 'Vendedor', // Ensure name is never null
            financing_title: document.getElementById('edit-fin-title').value,
            financing_bio: document.getElementById('edit-fin-bio').value,
            financing_how_it_works: document.getElementById('edit-fin-how').value,
            financing_whatsapp: document.getElementById('edit-fin-wa').value,
            updated_at: new Date()
        };

        const { error } = await supabase.from('perfil_vendedor').upsert(updates);
        if (error) alert("Erro: " + error.message);
        else alert("Configurações salvas!");
    };

    // Moto Modal
    const btnAddMoto = document.getElementById('btn-add-moto');
    if (btnAddMoto) btnAddMoto.onclick = () => {
        document.getElementById('moto-form').reset();
        document.getElementById('edit-moto-id').value = '';
        document.getElementById('moto-modal-title').textContent = 'Nova Moto';
        currentGallery = [];
        renderGalleryAdmin();

        // Clear Dropzone Previews
        document.querySelectorAll('.dropzone-preview').forEach(el => {
            el.style.backgroundImage = 'none';
            el.classList.remove('active');
        });
        document.querySelectorAll('.dropzone-content p').forEach(el => {
            // Reset text (hacky but works for now, or just leave it)
        });

        document.getElementById('moto-modal').style.display = 'block';
    };

    // Old Gallery Input Listener REMOVED to avoid double binding
    // The new setupGalleryDropzone handles it.

    const btnCloseMoto = document.getElementById('btn-close-moto');
    if (btnCloseMoto) btnCloseMoto.onclick = () => {
        document.getElementById('moto-modal').style.display = 'none';
    };

    const motoForm = document.getElementById('moto-form');
    if (motoForm) motoForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-moto-id').value;

        // Upload is handled by Dropzone immediately.

        const motoObj = {
            nome: document.getElementById('edit-moto-name').value,
            categoria: document.getElementById('edit-moto-cat').value,
            preco: document.getElementById('edit-moto-price').value,
            imagem_url: document.getElementById('edit-moto-img').value,
            galeria: currentGallery,
            descricao: document.getElementById('edit-moto-desc').value,
            specs: document.getElementById('edit-moto-specs').value,
            updated_at: new Date()
        };

        if (id) {
            const { error } = await supabase.from('motos').update(motoObj).eq('id', id);
            if (error) alert(error.message);
        } else {
            // New moto: set default active and order
            motoObj.ativo = true;
            motoObj.order = cachedData.motorcycles.length;
            const { error } = await supabase.from('motos').insert([motoObj]);
            if (error) alert(error.message);
        }

        await refreshData();
        document.getElementById('moto-modal').style.display = 'none';
    };

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.onclick = async () => {
        await supabase.auth.signOut();
        window.location.href = '/admin/index.html';
    };
}

window.editMoto = (id) => {
    const moto = cachedData.motorcycles.find(m => m.id == id);
    document.getElementById('edit-moto-id').value = moto.id;
    document.getElementById('edit-moto-name').value = moto.nome;
    document.getElementById('edit-moto-cat').value = moto.categoria;
    document.getElementById('edit-moto-price').value = moto.preco;
    document.getElementById('edit-moto-img').value = moto.imagem_url;
    document.getElementById('edit-moto-desc').value = moto.descricao;
    document.getElementById('edit-moto-specs').value = moto.specs;

    currentGallery = moto.galeria || [];
    renderGalleryAdmin();

    document.getElementById('moto-modal-title').textContent = 'Editar Moto';
    document.getElementById('moto-modal').style.display = 'block';
};

window.deleteMoto = async (id) => {
    const supabase = getSupabase();
    if (confirm('Deseja remover esta moto?')) {
        const { error } = await supabase.from('motos').delete().eq('id', id);
        if (error) alert(error.message);
        else await refreshData();
    }
};

/**
 * CONSORTIUM LOGIC
 */
function setupConsortiumActions() {
    const supabase = getSupabase();
    const form = document.getElementById('consortium-config-form');
    const btnCloseConf = document.getElementById('btn-close-conf');
    if (btnCloseConf) btnCloseConf.onclick = () => {
        document.getElementById('consortium-modal-admin').style.display = 'none';
    };

    const btnAddPlan = document.getElementById('btn-add-plan');
    if (btnAddPlan) btnAddPlan.onclick = () => {
        renderPlanRow({ parcelas: '', valor: '' });
    };

    if (form) form.onsubmit = async (e) => {
        e.preventDefault();
        const motoId = document.getElementById('conf-moto-id').value;
        const moto = cachedData.motorcycles.find(m => m.id == motoId);

        // 1. Update Consorcio Main Table
        const consData = {
            moto_id: motoId,
            enabled: document.getElementById('conf-consortium-enabled').checked,
            credito: document.getElementById('conf-consortium-credit').value,
            texto_info: document.getElementById('conf-consortium-text').value,
            whatsapp_especifico: document.getElementById('conf-consortium-wa').value,
            updated_at: new Date()
        };

        let consorcioId = moto.consorcio?.id;

        if (consorcioId) {
            await supabase.from('consorcios').update(consData).eq('id', consorcioId);
        } else {
            const { data } = await supabase.from('consorcios').insert([consData]).select().single();
            consorcioId = data.id;
        }

        // 2. Update Transfer Fields in Motos Table
        const transferUpdates = {
            transfer_enabled: document.getElementById('conf-transfer-enabled').checked,
            transfer_button_text: document.getElementById('conf-transfer-btn-text').value,
            transfer_message: document.getElementById('conf-transfer-msg').value,
            transfer_mandatory_fields: document.getElementById('conf-transfer-mandatory').checked
        };
        await supabase.from('motos').update(transferUpdates).eq('id', motoId);

        // 3. Update Plans (Delete all and re-insert)
        await supabase.from('planos_consorcio').delete().eq('consorcio_id', consorcioId);

        const planRows = document.querySelectorAll('.plan-item-edit');
        const plansToInsert = [];
        planRows.forEach(row => {
            const inst = row.querySelector('.inst-input').value;
            const val = row.querySelector('.val-input').value;
            if (inst && val) {
                plansToInsert.push({ consorcio_id: consorcioId, parcelas: parseInt(inst), valor: val });
            }
        });

        if (plansToInsert.length > 0) {
            await supabase.from('planos_consorcio').insert(plansToInsert);
        }

        alert("Configurações de consórcio salvas!");
        document.getElementById('consortium-modal-admin').style.display = 'none';
        await refreshData();
    };
}

window.configureConsortium = (id) => {
    const moto = cachedData.motorcycles.find(m => m.id == id);
    const cons = moto.consorcio;

    document.getElementById('conf-moto-id').value = moto.id;
    document.getElementById('conf-moto-name').textContent = moto.nome;

    document.getElementById('conf-consortium-enabled').checked = cons ? !!cons.enabled : false;
    document.getElementById('conf-consortium-credit').value = cons?.credito || moto.preco;
    document.getElementById('conf-consortium-text').value = cons?.texto_info || '';
    document.getElementById('conf-consortium-wa').value = cons?.whatsapp_especifico || '';

    document.getElementById('conf-transfer-enabled').checked = !!moto.transfer_enabled;
    document.getElementById('conf-transfer-btn-text').value = moto.transfer_button_text || 'Quero repasse de consórcio';
    document.getElementById('conf-transfer-msg').value = moto.transfer_message || 'Olá, gostaria de saber mais sobre o repasse da {moto}';
    document.getElementById('conf-transfer-mandatory').checked = !!moto.transfer_mandatory_fields;

    const plansContainer = document.getElementById('plans-container');
    plansContainer.innerHTML = '';

    if (cons?.planos_consorcio) {
        cons.planos_consorcio.forEach(plan => renderPlanRow(plan));
    }

    document.getElementById('consortium-modal-admin').style.display = 'block';
};

function renderPlanRow(plan) {
    const container = document.getElementById('plans-container');
    const div = document.createElement('div');
    div.className = 'plan-item-edit';
    div.innerHTML = `
        <input type="number" class="inst-input" value="${plan.parcelas || ''}" placeholder="Parc.">
        <input type="text" class="val-input" value="${plan.valor || ''}" placeholder="Valor">
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">
            <i class="bi bi-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function setupTabSwitching() {
    document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(`tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active');

            // Close mobile menu on click
            if (window.innerWidth <= 900) toggleMenu(false);
        };
    });
}

// Global Menu Toggle
window.toggleMenu = (forceState) => {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (typeof forceState === 'boolean') {
        if (forceState) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    } else {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
};
// ... existing toggleMenu ...

/**
 * DRAG & DROP LOGIC
 */
function setupDropzones() {
    // 1. Profile
    setupSingleDropzone('drop-profile', 'upload-pic', 'edit-pic', 'profile_images');
    // 2. Banner
    setupSingleDropzone('drop-banner', 'upload-banner', 'edit-banner', 'banners');
    // 3. Logo
    setupSingleDropzone('drop-logo', 'upload-logo', 'edit-logo', 'extras');
    // 4. Moto Main
    setupSingleDropzone('drop-moto-main', 'upload-moto-img', 'edit-moto-img', 'moto_images');
    // 5. Moto Gallery (Multiple)
    setupGalleryDropzone('drop-moto-gallery', 'upload-moto-gallery', 'moto_images');
}

function setupSingleDropzone(dropId, inputId, urlId, bucket) {
    const dropArea = document.getElementById(dropId);
    const input = document.getElementById(inputId);
    const urlInput = document.getElementById(urlId);

    if (!dropArea || !input) return;

    // Click to Open
    dropArea.onclick = () => input.click();

    // Drag Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });

    // Handle Drop
    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFiles(files[0]);
    });

    // Handle Input Change
    input.addEventListener('change', (e) => {
        if (input.files.length) handleFiles(input.files[0]);
    });

    async function handleFiles(file) {
        // Validation
        if (!file.type.startsWith('image/')) {
            alert('Apenas imagens são permitidas!');
            return;
        }

        // UI Loading
        const loader = dropArea.querySelector('.dropzone-loader');
        if (loader) loader.classList.add('active');

        // Text Update
        const textP = dropArea.querySelector('.dropzone-content p');
        const originalText = textP.textContent;
        textP.textContent = `Enviando ${file.name}...`;

        // Upload
        const publicUrl = await uploadFileToSupabase(file, bucket);

        if (publicUrl) {
            // Update Inputs
            urlInput.value = publicUrl;

            // Update Preview
            const preview = dropArea.querySelector('.dropzone-preview');
            if (preview) {
                preview.style.backgroundImage = `url('${publicUrl}')`;
                preview.classList.add('active');
            }
            textP.textContent = file.name;
        } else {
            textP.textContent = originalText;
        }

        if (loader) loader.classList.remove('active');
    }
}

function setupGalleryDropzone(dropId, inputId, bucket) {
    const dropArea = document.getElementById(dropId);
    const input = document.getElementById(inputId);

    if (!dropArea || !input) return;

    dropArea.onclick = () => input.click();

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropArea.addEventListener('dragover', () => dropArea.classList.add('dragover'));
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
    dropArea.addEventListener('drop', (e) => {
        dropArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleGalleryFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => {
        if (input.files.length) handleGalleryFiles(input.files);
    });

    async function handleGalleryFiles(files) {
        const loader = dropArea.querySelector('.dropzone-loader');
        if (loader) loader.classList.add('active');

        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(f => f.type.startsWith('image/'));

        if (validFiles.length < fileArray.length) {
            alert("Alguns arquivos não eram imagens e foram ignorados.");
        }

        const urls = await handleGalleryUpload(validFiles); // Uses existing function
        currentGallery = [...currentGallery, ...urls];
        renderGalleryAdmin(); // Uses existing function

        if (loader) loader.classList.remove('active');
        input.value = ''; // Reset
    }
}

async function uploadFileToSupabase(file, bucket) {
    const supabase = getSupabase();
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

    if (error) {
        console.error("Upload Error:", error);
        alert("Erro no upload: " + error.message);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
}

// Initialize Dropzones on Load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init ...
    setTimeout(setupDropzones, 1000); // Small delay to ensure DOM
});
