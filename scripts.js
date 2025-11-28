// scripts.js — gère l'affichage. des offres, filtres et pagination
document.addEventListener('DOMContentLoaded', function () {
    const offers = [
        {
            id: 2,
            title: 'Recrutement : Membres motivés pour réorganisation administrative',
            date: new Date('2025-11-19T00:00:00').toISOString(),
            description: "Nous recherchons plusieurs membres motivés afin de retravailler ensemble le fonctionnement administratif et l'organisation du serveur. Postulez via Discord en envoyant un message privé à @alexismcn.",
            skills: ['Gestion','RH','Rédaction','Organisation'],
            location: 'Télétravail',
            type: 'Mission Temporaire',
            category: 'Administratif',
            remote: true,
            url: 'offre-admin.html'
        },
        {
            id: 3,
            title: "Directeur de Pôle Sapeurs-Pompiers (SDIS 13)",
            date: new Date('2025-11-28T12:00:00').toISOString(),
            description: "Direction et développement du Pôle Sapeurs-Pompiers (SDIS 13) : management des effectifs, rédaction et mise à jour des procédures opérationnelles, organisation des sessions et montée en compétence des équipes.",
            skills: ['Management','Rédaction','Recrutement','Simulation secours','Leadership'],
            location: 'Télétravail',
            type: 'Permanent',
            category: 'Direction',
            remote: true,
            url: 'offre-sdis13.html'
        }
    ];
    const state = { filtered: offers.slice(), page: 0, pageSize: 100 };

    const offersGrid = document.getElementById('offersGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const loadMoreBtn = document.getElementById('loadMore');
    const clearBtn = document.getElementById('clearFilters');

    populateFilterOptions(offers);
    applyFilters();

    searchInput.addEventListener('input', debounce(applyFilters, 250));
    categoryFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        categoryFilter.value = '';
        typeFilter.value = '';
        applyFilters();
    });

    loadMoreBtn.addEventListener('click', function () {
        state.page++;
        renderOffers(state.filtered, true);
    });

    // --- Functions ---
    function applyFilters() {
        const q = searchInput.value.trim().toLowerCase();
        const cat = categoryFilter.value;
        // all offers are remote; location filter removed
        const type = typeFilter.value;

        state.page = 0;
        state.filtered = offers.filter(o => {
            if (cat && o.category !== cat) return false;
            if (type && o.type !== type) return false;
            if (q) {
                const hay = (o.title + ' ' + o.description + ' ' + (o.skills || []).join(' ')).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        renderOffers(state.filtered, false);
    }

    function renderOffers(list, append) {
        const start = state.page * state.pageSize;
        const take = list.slice(start, start + state.pageSize);

        if (!append) offersGrid.innerHTML = '';

        take.forEach(o => {
            const card = document.createElement('article');
            card.className = 'offer-card';
            card.setAttribute('role','listitem');
            card.innerHTML = `
                <div class="meta">
                    <div>
                        <h3>${escapeHtml(o.title)}</h3>
                        <div class="offer-date">${formatDate(o.date)}</div>
                    </div>
                    <div class="badge">${escapeHtml(o.type)}</div>
                </div>
                <p>${escapeHtml(o.description)}</p>
                <div class="tags">${(o.skills||[]).map(s=>`<span class="tag">${escapeHtml(s)}</span>`).join('')}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
                    <small style="color:#6b6b6b">${escapeHtml(o.remote ? 'Télétravail' : (o.location || ''))}</small>
                    <a class="view-more" href="${o.url ? escapeHtml(o.url) : `offre-detail.html?id=${o.id}`}">Voir</a>
                </div>
            `;
            offersGrid.appendChild(card);
        });

        // Toggle load more visibility
        const moreRemaining = (start + state.pageSize) < list.length;
        loadMoreBtn.style.display = moreRemaining ? 'inline-block' : 'none';
    }

    function populateFilterOptions(list) {
        const cats = uniq(list.map(o=>o.category)).sort();
        const types = uniq(list.map(o=>o.type)).sort();

        cats.forEach(c => categoryFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`));
        types.forEach(t => typeFilter.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`));
    }

    // --- Helpers ---
    function uniq(arr) { return Array.from(new Set(arr.filter(Boolean))); }
    function formatDate(d) { const dt = new Date(d); return dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' }); }
    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,arguments), wait); }; }

    // Sample data generator (for demo / prototyping)
    function generateSampleOffers(n){
        const cats = ['Technique','Administratif','Marketing','Design','Support'];
        const locs = ['Marseille','Télétravail','Aix-en-Provence','Hyères','Nice'];
        const types = ['Mission Temporaire','CDI','CDD','Stage'];
        const skillsPool = ['JavaScript','Google Sheets','No-code','Gestion','RH','UX','Figma','Node.js','SQL','Communication'];
        const out = [];
        for(let i=1;i<=n;i++){
            const cat = cats[i % cats.length];
            const loc = locs[i % locs.length];
            const type = types[i % types.length];
            const title = `${cat} — Projet #${i}`;
            const skills = [skillsPool[i % skillsPool.length], skillsPool[(i+3) % skillsPool.length]];
            out.push({
                id: i,
                title,
                date: new Date(Date.now() - i * 86400000).toISOString(),
                description: `Participation au projet ${i} pour réaliser des tâches liées à ${cat.toLowerCase()}.`,
                skills,
                location: loc,
                type,
                category: cat,
                remote: (loc === 'Télétravail')
            });
        }
        return out;
    }
});

