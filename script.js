// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAU9m89_OAsxJy7MggJkdY88wmvuCISALU",
  authDomain: "mamonas-acai.firebaseapp.com",
  projectId: "mamonas-acai",
  storageBucket: "mamonas-acai.firebasestorage.app",
  messagingSenderId: "778665319873",
  appId: "1:778665319873:web:bd7b95b2f65f5ac08aa340"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// ─────────────────────────────────────────────────────────────────────────────

// ─── CRÉDITO DO PRODUTOR (TF SOLUTIONS) ────────────────────────────────────────
// WhatsApp da TF Solutions, produtora deste site/sistema — usado só no link de
// crédito do rodapé (não é dado da loja, não vem do Firestore).
const TF_SOLUTIONS_WHATSAPP = "5551982165186";
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    // --- SELETORES GLOBAIS ---
    const cartIcon = document.querySelector(".cart-icon"),
        cartSidebar = document.querySelector(".cart-sidebar"),
        cartOverlay = document.querySelector(".cart-overlay"),
        closeCartBtn = document.querySelector(".close-cart-btn"),
        cartBody = document.querySelector(".cart-body"),
        cartBadge = document.querySelector(".cart-badge"),
        cartIconTotalElem = document.getElementById("cart-icon-total");
    const deliveryToggleBtns = document.querySelectorAll(".delivery-btn");
    const deliveryForm = document.getElementById("delivery-form-container"),
        pickupForm = document.getElementById("pickup-form-container");
    const trocoContainer = document.getElementById("troco-container");
    const couponInput = document.getElementById("coupon-input"),
        applyCouponBtn = document.getElementById("apply-coupon-btn"),
        couponFeedback = document.getElementById("coupon-feedback");
    const subtotalElem = document.getElementById("cart-subtotal"),
        cartDiscountElem = document.getElementById("cart-discount"),
        discountLineElem = document.querySelector(".discount-line"),
        totalElem = document.getElementById("cart-total");
    const finishOrderBtn = document.getElementById("finish-order-btn"),
        finishOrderTotalElem = document.getElementById("finish-order-total");
    // Seletores da barra inferior
    const viewCartBanner = document.querySelector(".view-cart-banner");
    const bannerTotalElem = document.getElementById("banner-total");
    const viewCartBannerBtn = document.querySelector(".view-cart-banner-btn");

    // Seletores das etapas do carrinho (1: itens, 2: entrega/retirada, 3: pagamento,
    // 4: identificação, 5: resumo — mais a tela de sucesso, fora da numeração)
    const cartStepsIndicator = document.getElementById("cart-steps-indicator"),
        cartStepsWrap = document.querySelector(".cart-steps-wrap"),
        cartSteps = document.querySelectorAll(".cart-step[data-step]"),
        cartStepDots = document.querySelectorAll(".cart-step-dot"),
        cartItemsCountElem = document.getElementById("cart-items-count"),
        cartStep1TotalElem = document.getElementById("cart-step1-total-valor"),
        cartNavButtons = document.getElementById("cart-nav-buttons"),
        cartNavVoltar = document.getElementById("cart-nav-voltar"),
        cartNavAvancar = document.getElementById("cart-nav-avancar"),
        cartNavAvancarTotalElem = document.getElementById("cart-nav-avancar-total"),
        cartStepSucesso = document.getElementById("cart-step-sucesso"),
        pedidoSucessoCodigoElem = document.getElementById("pedido-sucesso-codigo"),
        novoPedidoBtn = document.getElementById("cart-btn-novo-pedido"),
        resumoItensBloco = document.getElementById("resumo-itens-bloco"),
        resumoEntregaBloco = document.getElementById("resumo-entrega-bloco"),
        resumoPagamentoBloco = document.getElementById("resumo-pagamento-bloco"),
        resumoIdentificacaoBloco = document.getElementById("resumo-identificacao-bloco");
    let etapaAtual = 1;
    let etapaMaxAlcancada = 1;
    const idsPedidoGerados = new Set();

    // Seletores do modal de detalhes do produto (carrossel de fotos)
    const detailOverlay = document.getElementById("detail-overlay"),
        detailModal = document.getElementById("detail-modal"),
        detailClose = document.getElementById("detail-close"),
        detailTrack = document.getElementById("detail-carousel-track"),
        detailPrev = document.getElementById("detail-prev"),
        detailNext = document.getElementById("detail-next"),
        detailDots = document.getElementById("detail-dots"),
        detailBadgeDestaque = document.getElementById("detail-badge-destaque"),
        detailCodigoEl = document.getElementById("detail-codigo"),
        detailNomeEl = document.getElementById("detail-nome"),
        detailDetailsEl = document.getElementById("detail-details"),
        detailDescricaoEl = document.getElementById("detail-descricao"),
        detailTagEl = document.getElementById("detail-tag"),
        detailPriceEl = document.getElementById("detail-price"),
        detailComprarBtn = document.getElementById("detail-comprar-btn"),
        detailSizeGroup = document.getElementById("detail-size-group"),
        detailSizeSelect = document.getElementById("detail-size-select"),
        detailInclusoGroup = document.getElementById("detail-incluso-group"),
        detailInclusoLabel = document.getElementById("detail-incluso-label"),
        detailInclusoSelect = document.getElementById("detail-incluso-select"),
        detailComplementosGroup = document.getElementById("detail-complementos-group"),
        detailComplementosContador = document.getElementById("detail-complementos-contador"),
        detailComplementosLista = document.getElementById("detail-complementos-lista"),
        detailAdicionaisGroup = document.getElementById("detail-adicionais-group"),
        detailAdicionaisLista = document.getElementById("detail-adicionais-lista");

    // Seletores do logo (ícone padrão ou imagem própria, definida pelo admin)
    const logoImgEl = document.getElementById("logo-img");

    // Seletores para o sistema de filtro
    const searchInput = document.querySelector(".search-input");

    // --- CARREGAR PRODUTOS DO FIREBASE ---
    let produtos = [];
    try {
        const snap = await db.collection("produtos")
            .where("ativo", "!=", false)
            .get();
        produtos = snap.docs.map(d => ({ ...d.data() }));
    } catch (e) {
        console.error("Erro ao carregar produtos do Firebase:", e);
    }

    // --- CARREGAR CUPONS DO FIREBASE ---
    let coupons = [];
    try {
        const cuponsSnap = await db.collection("cupons").get();
        coupons = cuponsSnap.docs.map((d) => ({ docId: d.id, ...d.data() }));
    } catch (e) {
        console.error("Erro ao carregar cupons do Firebase:", e);
    }

    // --- CARREGAR CATEGORIAS DO FIREBASE ---
    // A barra de categorias da loja é montada a partir da coleção "categorias":
    // basta cadastrar/editar categorias pelo admin, sem precisar mexer neste arquivo.
    const CATEGORIAS_PADRAO = [
        { id: "acai", nome: "Açaí", icone: "fa-bowl-rice" },
        { id: "crepe-copo", nome: "Crepe no Copo", icone: "fa-ice-cream" },
        { id: "crepe-salgado", nome: "Crepe Salgado", icone: "fa-pizza-slice" },
        { id: "crepe-doce", nome: "Crepe Doce", icone: "fa-cookie" },
        { id: "milkshake", nome: "Milkshake", icone: "fa-mug-saucer" },
        { id: "sorvete", nome: "Sorvete no Copo", icone: "fa-ice-cream" },
    ];
    let categorias = [];
    try {
        const categoriasSnap = await db.collection("categorias").get();
        categorias = categoriasSnap.docs
            .map((d) => ({ ...d.data() }))
            .filter((c) => c.id !== "all"); // "Todos" já é gerado automaticamente
    } catch (e) {
        console.error("Erro ao carregar categorias do Firebase:", e);
    }
    if (!categorias.length) categorias = CATEGORIAS_PADRAO;

    // --- CARREGAR CONFIGURAÇÕES DA LOJA DO FIREBASE ---
    const CONFIG_PADRAO = {
        nomeLoja: "Mamona's Açaí",
        whatsapp: "5551997619270",
        retiradaDias: [0, 1, 2, 3, 4, 5, 6],
        retiradaHoraInicio: "08:00",
        retiradaHoraFim: "18:00",
        retiradaIntervalo: 60,
        retiradaPausaInicio: "",
        retiradaPausaFim: "",
        bannerUrl: "https://images.unsplash.com/photo-1684403620650-81dc661a69db?auto=format&fit=crop&w=1600&h=500&q=80",
        corPrimaria: "#7C3AED",
        corSecundaria: "#1E1033",
        corDestaque: "#F2C94C",
        heroTag: "Sabor de verdade",
        heroTitulo: "Açaí, crepes e muito mais",
        heroSubtitulo: "Monte do seu jeito e peça em poucos cliques",
        heroCorFundo: "#1E1033",
        heroCorFundoFim: "#5B21B6",
        logoUrl: "",
        entregaDisponivel: true,
        retiradaDisponivel: true,
        sobreNome: "",
        sobreTexto: "",
        sobreFoto: "",
        sobreLink: "",
    };
    let configLoja = { ...CONFIG_PADRAO };
    try {
        const configDoc = await db.collection("configuracoes").doc("geral").get();
        if (configDoc.exists) configLoja = { ...CONFIG_PADRAO, ...configDoc.data() };
    } catch (e) {
        console.error("Erro ao carregar configurações da loja:", e);
    }

    // --- ESTADO DA APLICAÇÃO ---
    // (declarado antes de aplicarConfiguracoesDaLoja porque ela pode ajustar tipoEntrega)
    let carrinho = [],
        tipoEntrega = "delivery",
        appliedCoupon = null;

    // Variáveis de estado para filtros
    // null = tela de categorias (nenhuma escolhida ainda); "all" existe só como valor do
    // botão "Categorias" na barra do topo, que também volta pra tela de categorias.
    let categoriaAtiva = null;
    let termoBusca = "";

    // Calcula se uma cor hexadecimal é "clara" (pra decidir se o texto por cima
    // dela deve ficar branco ou escuro, e continuar legível).
    const corEhClara = (hex) => {
        const c = (hex || "").replace("#", "");
        if (c.length !== 6) return false;
        const r = parseInt(c.substr(0, 2), 16) / 255,
            g = parseInt(c.substr(2, 2), 16) / 255,
            b = parseInt(c.substr(4, 2), 16) / 255;
        const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        const luminancia = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        return luminancia > 0.5;
    };

    const aplicarConfiguracoesDaLoja = () => {
        document.title = configLoja.nomeLoja;

        const root = document.documentElement;
        if (configLoja.corPrimaria) root.style.setProperty("--primary-color", configLoja.corPrimaria);
        if (configLoja.corSecundaria) root.style.setProperty("--secondary-color", configLoja.corSecundaria);
        if (configLoja.corDestaque) root.style.setProperty("--accent-color", configLoja.corDestaque);

        const logoTitleEl = document.querySelector(".logo h1");
        if (logoTitleEl) logoTitleEl.textContent = configLoja.nomeLoja;

        // Logo: imagem própria (definida pelo admin) — sem imagem cadastrada, o espaço fica vazio
        if (configLoja.logoUrl) {
            logoImgEl.src = configLoja.logoUrl;
            logoImgEl.alt = configLoja.nomeLoja;
            logoImgEl.hidden = false;
        } else {
            logoImgEl.hidden = true;
        }

        const heroTagEl = document.querySelector(".hero-tag"),
            heroTituloEl = document.querySelector(".hero-content h2"),
            heroSubtituloEl = document.querySelector(".hero-content p"),
            heroSectionEl = document.querySelector(".hero-section");
        if (heroTagEl && configLoja.heroTag) heroTagEl.textContent = configLoja.heroTag;
        if (heroTituloEl && configLoja.heroTitulo) heroTituloEl.textContent = configLoja.heroTitulo;
        if (heroSubtituloEl && configLoja.heroSubtitulo) heroSubtituloEl.textContent = configLoja.heroSubtitulo;
        if (heroSectionEl && configLoja.bannerUrl) {
            // Foto de fundo (definida pelo admin em "Foto de fundo do hero") com uma camada escura
            // por cima, pra manter o texto branco legível — no lugar do degradê de cores.
            heroSectionEl.style.backgroundImage = `linear-gradient(to bottom, rgba(30,16,51,.55), rgba(30,16,51,.8)), url("${configLoja.bannerUrl}")`;
            heroSectionEl.classList.add("hero-section--foto");
            heroSectionEl.classList.remove("hero-section--claro");
        } else if (heroSectionEl && configLoja.heroCorFundo) {
            if (configLoja.heroCorFundoFim) {
                // Degradê entre as duas cores escolhidas pelo admin
                root.style.setProperty("--hero-bg-color", `linear-gradient(135deg, ${configLoja.heroCorFundo}, ${configLoja.heroCorFundoFim})`);
                // Só troca pra texto escuro se as DUAS cores forem claras — com uma cor escura no meio,
                // o texto branco continua legível em praticamente todo o degradê.
                heroSectionEl.classList.toggle("hero-section--claro", corEhClara(configLoja.heroCorFundo) && corEhClara(configLoja.heroCorFundoFim));
            } else {
                root.style.setProperty("--hero-bg-color", configLoja.heroCorFundo);
                // Se a cor escolhida for clara, troca o texto/tag pra tons escuros (senão fica ilegível)
                heroSectionEl.classList.toggle("hero-section--claro", corEhClara(configLoja.heroCorFundo));
            }
        }

        const footerEl = document.querySelector("footer p");
        if (footerEl) {
            const ano = new Date().getFullYear();
            footerEl.textContent = `${ano} - ${configLoja.nomeLoja}. Todos os direitos reservados`;
        }

        // Crédito da TF Solutions (produtora do site/sistema) no rodapé
        const footerCreditLinkEl = document.getElementById("footer-credit-link");
        if (footerCreditLinkEl) {
            const msg = "Olá! Vi o site da " + configLoja.nomeLoja + " e queria saber mais sobre esse site/sistema.";
            footerCreditLinkEl.href = `https://wa.me/${TF_SOLUTIONS_WHATSAPP}?text=${encodeURIComponent(msg)}`;
        }

        const pickupDateInput = document.getElementById("pickup-date");
        if (pickupDateInput) {
            const hoje = new Date();
            pickupDateInput.min = hoje.toISOString().split("T")[0];
        }

        const pickupTimeSelect = document.getElementById("pickup-time");
        if (pickupTimeSelect) {
            const [hIni, mIni] = configLoja.retiradaHoraInicio.split(":").map(Number);
            const [hFim, mFim] = configLoja.retiradaHoraFim.split(":").map(Number);
            const inicioMin = hIni * 60 + mIni;
            const fimMin = hFim * 60 + mFim;
            const passo = configLoja.retiradaIntervalo || 60;
            // Horário bloqueado pelo admin (ex: pausa/compromisso pessoal) — some das opções, se configurado
            let pausaInicioMin = null, pausaFimMin = null;
            if (configLoja.retiradaPausaInicio && configLoja.retiradaPausaFim) {
                const [hPI, mPI] = configLoja.retiradaPausaInicio.split(":").map(Number);
                const [hPF, mPF] = configLoja.retiradaPausaFim.split(":").map(Number);
                pausaInicioMin = hPI * 60 + mPI;
                pausaFimMin = hPF * 60 + mPF;
            }
            let opcoes = `<option value="" disabled selected>Selecione</option>`;
            for (let m = inicioMin; m <= fimMin; m += passo) {
                if (pausaInicioMin !== null && m >= pausaInicioMin && m < pausaFimMin) continue;
                const h = String(Math.floor(m / 60)).padStart(2, "0");
                const min = String(m % 60).padStart(2, "0");
                opcoes += `<option value="${h}:${min}">${h}:${min}</option>`;
            }
            pickupTimeSelect.innerHTML = opcoes;
        }

        // Disponibilidade de Entrega/Retirada (configurável pelo admin, ex: motoboy indisponível no dia)
        const entregaBtn = document.querySelector('.delivery-btn[data-option="delivery"]');
        const pickupBtn = document.querySelector('.delivery-btn[data-option="pickup"]');
        const entregaDisponivel = configLoja.entregaDisponivel !== false;
        const retiradaDisponivel = configLoja.retiradaDisponivel !== false;
        if (entregaBtn) entregaBtn.hidden = !entregaDisponivel;
        if (pickupBtn) pickupBtn.hidden = !retiradaDisponivel;
        if (!entregaDisponivel && retiradaDisponivel) {
            tipoEntrega = "pickup";
            entregaBtn?.classList.remove("active");
            entregaBtn?.setAttribute("aria-selected", "false");
            pickupBtn?.classList.add("active");
            pickupBtn?.setAttribute("aria-selected", "true");
            deliveryForm.style.display = "none";
            pickupForm.style.display = "block";
        } else if (entregaDisponivel && !retiradaDisponivel) {
            tipoEntrega = "delivery";
            pickupBtn?.classList.remove("active");
            pickupBtn?.setAttribute("aria-selected", "false");
            entregaBtn?.classList.add("active");
            entregaBtn?.setAttribute("aria-selected", "true");
            pickupForm.style.display = "none";
            deliveryForm.style.display = "block";
        }

        // Seção "Sobre a empreendedora" (opcional — só aparece se houver texto configurado)
        const aboutSection = document.getElementById("about-section");
        if (aboutSection && configLoja.sobreTexto) {
            const aboutNomeEl = document.getElementById("about-nome"),
                aboutTextoEl = document.getElementById("about-texto"),
                aboutPhotoEl = document.getElementById("about-photo");
            aboutNomeEl.textContent = configLoja.sobreNome || "";
            aboutTextoEl.textContent = configLoja.sobreTexto;
            if (configLoja.sobreFoto) {
                aboutPhotoEl.src = configLoja.sobreFoto;
                aboutPhotoEl.alt = configLoja.sobreNome || "";
                aboutPhotoEl.hidden = false;
            } else {
                aboutPhotoEl.hidden = true;
            }
            const aboutLinkEl = document.getElementById("about-link");
            if (aboutLinkEl) {
                if (configLoja.sobreLink) {
                    aboutLinkEl.href = configLoja.sobreLink;
                    aboutLinkEl.hidden = false;
                } else {
                    aboutLinkEl.hidden = true;
                }
            }
            const aboutWhatsappEl = document.getElementById("about-whatsapp-link");
            if (aboutWhatsappEl) {
                if (configLoja.whatsapp) {
                    const msg = "Olá! Vi a loja " + configLoja.nomeLoja + " e gostaria de saber mais.";
                    aboutWhatsappEl.href = `https://wa.me/${configLoja.whatsapp}?text=${encodeURIComponent(msg)}`;
                    aboutWhatsappEl.hidden = false;
                } else {
                    aboutWhatsappEl.hidden = true;
                }
            }
            aboutSection.hidden = false;
            const navSobreEl = document.getElementById("nav-sobre-link");
            if (navSobreEl) navSobreEl.hidden = false;
        }
    };
    aplicarConfiguracoesDaLoja();

    const formatarMoeda = (v) =>
        v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    // Código do produto: usa o código cadastrado pelo admin (etiqueta própria dele) ou,
    // se não tiver, o número sequencial do produto — sempre existe um código pra mostrar,
    // pra facilitar a empreendedora identificar a peça certa na hora de separar o pedido.
    const codigoDoProduto = (p) => p.codigo || `#${p.id}`;
    const getScrollbarWidth = () =>
        window.innerWidth - document.documentElement.clientWidth;
    const lockScroll = () => {
        document.body.style.paddingRight = `${getScrollbarWidth()}px`;
        document.body.classList.add("no-scroll");
    };
    const unlockScroll = () => {
        document.body.style.paddingRight = "";
        document.body.classList.remove("no-scroll");
    };
    const abrirCarrinho = () => {
        cartSidebar.classList.add("show");
        cartOverlay.classList.add("show");
        lockScroll();
    };
    const fecharCarrinho = () => {
        cartSidebar.classList.remove("show");
        cartOverlay.classList.remove("show");
        unlockScroll();
    };

    // --- ETAPAS DO CARRINHO (1: itens · 2: entrega/retirada · 3: pagamento · 4: identificação · 5: resumo) ---
    // Gera um código de pedido de 8 caracteres (2 letras + 6 alfanuméricos), sem usar
    // caracteres fáceis de confundir (O/0, I/1). Não há como garantir 100% de unicidade
    // contra pedidos antigos sem gravar todos os pedidos no Firestore (o que mudaria o
    // schema do banco) — mas o espaço de combinações é enorme (mais de 600 bilhões), então
    // a chance de repetição é desprezível na prática. Dentro da mesma sessão, ainda
    // evitamos repetir gerando de novo em caso de colisão.
    const gerarIdPedido = () => {
        const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const ALFANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const sorteia = (chars) => chars[Math.floor(Math.random() * chars.length)];
        let id;
        do {
            id = sorteia(LETRAS) + sorteia(LETRAS);
            for (let i = 0; i < 6; i++) id += sorteia(ALFANUM);
        } while (idsPedidoGerados.has(id));
        idsPedidoGerados.add(id);
        return id;
    };

    const validarCampos = (ids) => {
        let valid = true;
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            let isFieldValid = el.value.trim() !== "";

            if (id.includes("nome") && isFieldValid) {
                if (el.value.trim().split(" ").filter((word) => word).length < 2) {
                    isFieldValid = false;
                }
            }

            if (!isFieldValid) {
                el.classList.add("error");
                valid = false;
            } else {
                el.classList.remove("error");
            }
        });
        if (!valid) {
            alert("Por favor, preencha todos os campos obrigatórios marcados em vermelho.");
        }
        return valid;
    };

    const validarEtapaAtual = () => {
        if (etapaAtual === 1) {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione produtos antes de continuar.");
                return false;
            }
            return true;
        }
        if (etapaAtual === 2) {
            if (tipoEntrega === "pickup") {
                const dataInput = document.getElementById("pickup-date");
                if (dataInput.value) {
                    const [ano, mes, dia] = dataInput.value.split("-").map(Number);
                    const diaSemana = new Date(ano, mes - 1, dia).getDay();
                    if (!configLoja.retiradaDias.includes(diaSemana)) {
                        dataInput.classList.add("error");
                        alert("A loja não realiza retiradas no dia selecionado. Escolha outra data.");
                        return false;
                    }
                }
                return validarCampos(["pickup-date", "pickup-time"]);
            }
            return validarCampos(["delivery-cep", "delivery-address"]);
        }
        if (etapaAtual === 4) {
            return validarCampos(["identificacao-nome", "identificacao-telefone"]);
        }
        return true;
    };

    const renderResumo = () => {
        const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
        const discountAmount = calcularDesconto(subtotal);

        resumoItensBloco.innerHTML = `
            <h5>Itens (${carrinho.reduce((acc, i) => acc + i.quantidade, 0)})</h5>
            <ul class="resumo-lista">
                ${carrinho.map((item) => `
                    <li>
                        <span>${item.quantidade}x [${codigoDoProduto(item)}] ${item.nome}${detalhesDoItem(item).length ? ` (${detalhesDoItem(item).join(" · ")})` : ""}</span>
                        <span class="resumo-item-valor">${formatarMoeda(item.preco * item.quantidade)}</span>
                    </li>`).join("")}
            </ul>`;

        if (tipoEntrega === "delivery") {
            const cep = document.getElementById("delivery-cep").value;
            const endereco = document.getElementById("delivery-address").value;
            resumoEntregaBloco.innerHTML = `
                <h5>Entrega (Moto)</h5>
                <p>CEP: ${cep}</p>
                <p>Endereço: ${endereco}</p>`;
        } else {
            const dataInput = document.getElementById("pickup-date").value;
            const hora = document.getElementById("pickup-time").value;
            let dataFormatada = "";
            if (dataInput) {
                const [year, month, day] = dataInput.split("-");
                dataFormatada = `${day}/${month}/${year}`;
            }
            resumoEntregaBloco.innerHTML = `
                <h5>Retirada</h5>
                <p>Data: ${dataFormatada}</p>
                <p>Hora: ${hora}</p>`;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "";
        const precisaTalher = document.getElementById("talher-checkbox")?.checked;
        const observacoes = document.getElementById("observacoes-input")?.value.trim();
        let pagamentoHtml = `<h5>Pagamento</h5><p>${paymentMethod}`;
        if (paymentMethod === "Dinheiro") {
            const troco = document.getElementById("troco-para").value;
            pagamentoHtml += troco ? ` (Troco para R$ ${troco})` : " (Não precisa de troco)";
        }
        pagamentoHtml += "</p>";
        if (appliedCoupon) pagamentoHtml += `<p>Cupom: ${appliedCoupon.codigo} (- ${formatarMoeda(discountAmount)})</p>`;
        if (precisaTalher) pagamentoHtml += `<p>Colher/canudo descartável: Sim</p>`;
        if (observacoes) pagamentoHtml += `<p>Observações: ${observacoes}</p>`;
        resumoPagamentoBloco.innerHTML = pagamentoHtml;

        const nome = document.getElementById("identificacao-nome").value;
        const telefone = document.getElementById("identificacao-telefone").value;
        resumoIdentificacaoBloco.innerHTML = `
            <h5>Seus dados</h5>
            <p>${nome}</p>
            <p>${telefone}</p>`;
    };

    const mostrarEtapa = (n) => {
        etapaAtual = n;
        if (n > etapaMaxAlcancada) etapaMaxAlcancada = n;
        cartSteps.forEach((el) => { el.hidden = Number(el.dataset.step) !== n; });
        cartStepDots.forEach((dot) => {
            const step = Number(dot.dataset.step);
            dot.classList.toggle("active", step === n);
            // "done" também controla se o ponto é clicável (CSS: cursor:pointer só em .done) —
            // por isso usa etapaMaxAlcancada (até onde o cliente já validou), não só "step < n".
            dot.classList.toggle("done", step !== n && step <= etapaMaxAlcancada);
        });
        cartNavVoltar.hidden = n === 1;
        cartNavAvancar.hidden = n === 5;
        finishOrderBtn.hidden = n !== 5;
        if (n === 5) renderResumo();
        cartStepsWrap.scrollTop = 0;
    };

    const mostrarSucesso = (pedidoId) => {
        cartSteps.forEach((el) => { el.hidden = true; });
        cartStepsIndicator.hidden = true;
        cartNavButtons.hidden = true;
        pedidoSucessoCodigoElem.textContent = pedidoId;
        cartStepSucesso.hidden = false;
        cartStepsWrap.scrollTop = 0;
    };

    const iniciarNovoPedido = () => {
        carrinho = [];
        appliedCoupon = null;
        couponInput.value = "";
        couponFeedback.textContent = "";
        couponFeedback.classList.remove("success", "error");
        const talherCheckbox = document.getElementById("talher-checkbox");
        if (talherCheckbox) talherCheckbox.checked = false;
        const observacoesInput = document.getElementById("observacoes-input");
        if (observacoesInput) observacoesInput.value = "";
        atualizarCarrinho();
        cartStepsIndicator.hidden = false;
        cartNavButtons.hidden = false;
        cartStepSucesso.hidden = true;
        etapaMaxAlcancada = 1;
        mostrarEtapa(1);
        fecharCarrinho();
    };

    // --- MODAL DE DETALHES DO PRODUTO (carrossel de fotos) ---
    // Mostra a foto principal + fotos extras (campo "galeria", cadastrado no admin) num
    // carrossel, além dos detalhes do produto. Abre ao clicar na foto do card.
    let detailFotos = [];
    let detailIndice = 0;
    let detailProdutoAtual = null;

    const renderDetailCarrossel = () => {
        detailTrack.innerHTML = detailFotos
            .map((src) => `<img src="${src}" alt="${detailProdutoAtual ? detailProdutoAtual.nome : ""}">`)
            .join("");
        const multiplas = detailFotos.length > 1;
        detailPrev.hidden = !multiplas;
        detailNext.hidden = !multiplas;
        detailDots.hidden = !multiplas;
        if (multiplas) {
            detailDots.innerHTML = detailFotos
                .map((_, i) => `<span data-i="${i}"></span>`)
                .join("");
        }
        atualizarPosicaoCarrossel();
    };

    const atualizarPosicaoCarrossel = () => {
        detailTrack.style.transform = `translateX(-${detailIndice * 100}%)`;
        detailDots.querySelectorAll("span").forEach((dot, i) => {
            dot.classList.toggle("active", i === detailIndice);
        });
    };

    const moverCarrossel = (delta) => {
        if (!detailFotos.length) return;
        detailIndice = (detailIndice + delta + detailFotos.length) % detailFotos.length;
        atualizarPosicaoCarrossel();
    };

    // Normaliza as opções de "tamanhos" do produto — sempre devolve pelo menos um
    // tamanho (mesmo produtos sem variação viram um único tamanho "padrão" internamente,
    // pra não precisar duplicar lógica de preço/complementos em outro lugar).
    const tamanhosDoProduto = (produto) => {
        if (Array.isArray(produto.tamanhos) && produto.tamanhos.length) return produto.tamanhos;
        return [{ nome: null, preco: Number(produto.preco) || 0, complementosGratis: 0 }];
    };

    // Estado da seleção atual no modal de detalhes (reseta toda vez que abre um produto)
    let detailTamanhoIdx = 0;
    let detailComplementosSelecionados = [];
    let detailAdicionaisSelecionados = [];

    const detailTamanhoAtual = () => {
        const tamanhos = tamanhosDoProduto(detailProdutoAtual);
        return tamanhos[detailTamanhoIdx] || tamanhos[0];
    };

    const detailPrecoUnitario = () => {
        const base = detailTamanhoAtual()?.preco || 0;
        const extras = detailAdicionaisSelecionados.reduce((acc, a) => acc + (Number(a.preco) || 0), 0);
        return base + extras;
    };

    const renderDetailComplementos = () => {
        const lista = Array.isArray(detailProdutoAtual?.complementosLista) ? detailProdutoAtual.complementosLista : [];
        const limite = Number(detailTamanhoAtual()?.complementosGratis) || 0;
        if (!lista.length || limite <= 0) { detailComplementosGroup.hidden = true; return; }
        detailComplementosGroup.hidden = false;
        const atingiuLimite = detailComplementosSelecionados.length >= limite;
        detailComplementosContador.textContent = `(${detailComplementosSelecionados.length}/${limite})`;
        detailComplementosContador.classList.toggle("limite-atingido", atingiuLimite);
        detailComplementosLista.innerHTML = lista.map((nome) => {
            const marcado = detailComplementosSelecionados.includes(nome);
            const desabilitado = !marcado && atingiuLimite;
            return `<label class="detail-checklist-item${marcado ? " selecionado" : ""}${desabilitado ? " desabilitado" : ""}">
                <span class="detail-checklist-item-nome"><input type="checkbox" data-complemento="${nome}" ${marcado ? "checked" : ""} ${desabilitado ? "disabled" : ""}> ${nome}</span>
            </label>`;
        }).join("");
    };

    const renderDetailAdicionais = () => {
        const lista = Array.isArray(detailProdutoAtual?.adicionaisPagos) ? detailProdutoAtual.adicionaisPagos : [];
        if (!lista.length) { detailAdicionaisGroup.hidden = true; return; }
        detailAdicionaisGroup.hidden = false;
        detailAdicionaisLista.innerHTML = lista.map((item) => {
            const marcado = detailAdicionaisSelecionados.some((a) => a.nome === item.nome);
            return `<label class="detail-checklist-item${marcado ? " selecionado" : ""}">
                <span class="detail-checklist-item-nome"><input type="checkbox" data-adicional="${item.nome}" ${marcado ? "checked" : ""}> ${item.nome}</span>
                <span class="detail-checklist-item-preco">+ ${formatarMoeda(Number(item.preco) || 0)}</span>
            </label>`;
        }).join("");
    };

    const atualizarPrecoDetalhe = () => {
        detailPriceEl.textContent = formatarMoeda(detailPrecoUnitario());
    };

    const abrirDetalhe = (produtoId) => {
        const produto = produtos.find((p) => p.id === produtoId);
        if (!produto) return;
        detailProdutoAtual = produto;
        detailFotos = [produto.imagem, ...(Array.isArray(produto.galeria) ? produto.galeria : [])].filter(Boolean);
        detailIndice = 0;
        renderDetailCarrossel();

        detailBadgeDestaque.hidden = !produto.destaque;
        detailCodigoEl.textContent = `Código: ${codigoDoProduto(produto)}`;
        detailNomeEl.textContent = produto.nome;
        detailDetailsEl.hidden = true;

        detailDescricaoEl.textContent = produto.descricao || "";

        const esgotado = produto.estoque !== undefined && produto.estoque !== null && Number(produto.estoque) <= 0;
        if (esgotado) {
            detailTagEl.textContent = "Esgotado";
            detailTagEl.className = "product-tag tag-esgotado";
            detailTagEl.hidden = false;
        } else if (produto.disponibilidade === "encomenda") {
            detailTagEl.textContent = `Sob encomenda${produto.prazoDias ? ` · ${produto.prazoDias} dias` : ""}`;
            detailTagEl.className = "product-tag tag-encomenda";
            detailTagEl.hidden = false;
        } else {
            detailTagEl.hidden = true;
        }

        // Reseta a seleção sempre que abre um produto
        detailTamanhoIdx = 0;
        detailComplementosSelecionados = [];
        detailAdicionaisSelecionados = [];

        const tamanhos = tamanhosDoProduto(produto);
        const temTamanhos = tamanhos.length > 1;
        if (temTamanhos) {
            detailSizeSelect.innerHTML = tamanhos
                .map((t, i) => `<option value="${i}">${t.nome} — ${formatarMoeda(t.preco)}</option>`)
                .join("");
            detailSizeSelect.value = "0";
            detailSizeGroup.hidden = false;
        } else {
            detailSizeGroup.hidden = true;
        }

        if (produto.opcaoInclusa && Array.isArray(produto.opcaoInclusa.opcoes) && produto.opcaoInclusa.opcoes.length) {
            detailInclusoLabel.textContent = produto.opcaoInclusa.label || "Escolha uma opção";
            detailInclusoSelect.innerHTML =
                `<option value="" selected disabled>Escolha</option>` +
                produto.opcaoInclusa.opcoes.map((o) => `<option value="${o}">${o}</option>`).join("");
            detailInclusoGroup.hidden = false;
        } else {
            detailInclusoGroup.hidden = true;
        }

        renderDetailComplementos();
        renderDetailAdicionais();
        atualizarPrecoDetalhe();

        detailComprarBtn.disabled = esgotado;
        detailComprarBtn.textContent = esgotado ? "Esgotado" : "Adicionar ao carrinho";

        detailOverlay.classList.add("show");
        detailModal.classList.add("show");
        lockScroll();
    };

    const fecharDetalhe = () => {
        detailOverlay.classList.remove("show");
        detailModal.classList.remove("show");
        detailProdutoAtual = null;
        unlockScroll();
    };

    detailClose.addEventListener("click", fecharDetalhe);
    detailOverlay.addEventListener("click", fecharDetalhe);
    detailPrev.addEventListener("click", () => moverCarrossel(-1));
    detailNext.addEventListener("click", () => moverCarrossel(1));
    detailDots.addEventListener("click", (e) => {
        const dot = e.target.closest("span[data-i]");
        if (!dot) return;
        detailIndice = Number.parseInt(dot.dataset.i);
        atualizarPosicaoCarrossel();
    });

    detailSizeSelect.addEventListener("change", () => {
        detailTamanhoIdx = Number(detailSizeSelect.value) || 0;
        // Muda de tamanho pode reduzir o limite de complementos grátis — descarta os que passarem do limite
        const novoLimite = Number(detailTamanhoAtual()?.complementosGratis) || 0;
        if (detailComplementosSelecionados.length > novoLimite) {
            detailComplementosSelecionados = detailComplementosSelecionados.slice(0, novoLimite);
        }
        renderDetailComplementos();
        atualizarPrecoDetalhe();
    });

    detailComplementosLista.addEventListener("change", (e) => {
        const input = e.target.closest("input[data-complemento]");
        if (!input) return;
        const nome = input.dataset.complemento;
        if (input.checked) {
            if (!detailComplementosSelecionados.includes(nome)) detailComplementosSelecionados.push(nome);
        } else {
            detailComplementosSelecionados = detailComplementosSelecionados.filter((c) => c !== nome);
        }
        renderDetailComplementos();
    });

    detailAdicionaisLista.addEventListener("change", (e) => {
        const input = e.target.closest("input[data-adicional]");
        if (!input) return;
        const nome = input.dataset.adicional;
        const item = (detailProdutoAtual.adicionaisPagos || []).find((a) => a.nome === nome);
        if (!item) return;
        if (input.checked) {
            if (!detailAdicionaisSelecionados.some((a) => a.nome === nome)) detailAdicionaisSelecionados.push(item);
        } else {
            detailAdicionaisSelecionados = detailAdicionaisSelecionados.filter((a) => a.nome !== nome);
        }
        renderDetailAdicionais();
        atualizarPrecoDetalhe();
    });

    detailComprarBtn.addEventListener("click", () => {
        if (!detailProdutoAtual || detailComprarBtn.disabled) return;
        if (!detailSizeGroup.hidden && !detailSizeSelect.value) {
            alert("Escolha o tamanho antes de adicionar ao carrinho.");
            detailSizeSelect.focus();
            return;
        }
        if (!detailInclusoGroup.hidden && !detailInclusoSelect.value) {
            alert(`Escolha "${detailInclusoLabel.textContent}" antes de adicionar ao carrinho.`);
            detailInclusoSelect.focus();
            return;
        }
        adicionarAoCarrinho(detailProdutoAtual.id, null, {
            tamanho: detailSizeGroup.hidden ? null : detailTamanhoAtual().nome,
            opcaoInclusa: detailInclusoGroup.hidden ? null : detailInclusoSelect.value,
            complementos: [...detailComplementosSelecionados],
            adicionais: [...detailAdicionaisSelecionados],
            preco: detailPrecoUnitario(),
        });
        fecharDetalhe();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && detailModal.classList.contains("show")) fecharDetalhe();
        if (detailModal.classList.contains("show") && detailFotos.length > 1) {
            if (e.key === "ArrowLeft") moverCarrossel(-1);
            if (e.key === "ArrowRight") moverCarrossel(1);
        }
    });

    const animacaoVoarParaCarrinho = (productCard) => {
        const productImg = productCard.querySelector(".product-img"),
            imgRect = productImg.getBoundingClientRect(),
            cartRect = cartIcon.getBoundingClientRect(),
            flyingImg = document.createElement("img");
        flyingImg.src = productImg.src;
        flyingImg.classList.add("product-image-fly");
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;
        document.body.appendChild(flyingImg);
        requestAnimationFrame(() => {
            flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
            flyingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
            flyingImg.style.width = "0px";
            flyingImg.style.height = "0px";
            flyingImg.style.opacity = "0";
        });
        flyingImg.addEventListener("transitionend", () => flyingImg.remove());
    };

    // Ponto único pra trocar de categoria — chamado pelos ladrilhos de categoria
    // e pelo botão "voltar às categorias".
    const selecionarCategoria = (categoriaId) => {
        categoriaAtiva = categoriaId === "all" ? null : categoriaId;
        filtrarEMostrarProdutos();
        document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Tela inicial de categorias — mostrada antes do cliente escolher o que quer ver,
    // pra não jogar todos os produtos misturados de cara.
    const renderCategoriaTiles = () => {
        const heading = document.getElementById("products-heading");
        heading.hidden = true;
        heading.innerHTML = "";

        const container = document.querySelector(".products-container");
        container.classList.add("category-tiles-view");
        if (!categorias.length) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #999;">
                    <p style="font-size: 1.1rem; font-weight: 600;">Nenhuma categoria cadastrada ainda</p>
                </div>`;
            return;
        }
        container.innerHTML = categorias
            .map((c) =>
                c.foto
                    ? `
            <button class="category-tile category-tile--foto" data-category="${c.id}">
                <img class="category-tile-photo" src="${c.foto}" alt="" loading="lazy">
                <span class="category-tile-name">${c.nome}</span>
            </button>`
                    : `
            <button class="category-tile" data-category="${c.id}">
                <span class="category-tile-icon"><i class="fa-solid ${c.icone || "fa-tag"}" aria-hidden="true"></i></span>
                <span class="category-tile-name">${c.nome}</span>
            </button>`,
            )
            .join("");
    };

    // Função para filtrar e mostrar produtos
    const filtrarEMostrarProdutos = () => {
        // Sem categoria escolhida e sem busca: mostra a tela de categorias, não os produtos
        // misturados. Uma busca digitada, porém, procura em todas as categorias mesmo assim.
        if (!categoriaAtiva && termoBusca.trim() === "") {
            renderCategoriaTiles();
            return;
        }

        let produtosFiltrados = produtos;

        // Filtro por categoria
        if (categoriaAtiva) {
            produtosFiltrados = produtosFiltrados.filter(
                (produto) => produto.categoria === categoriaAtiva,
            );
        }

        // Filtro por busca
        if (termoBusca.trim() !== "") {
            const termo = termoBusca.toLowerCase();
            produtosFiltrados = produtosFiltrados.filter(
                (produto) =>
                    produto.nome.toLowerCase().includes(termo) ||
                    (produto.descricao || "").toLowerCase().includes(termo),
            );
        }

        // Produtos em destaque aparecem primeiro (mantendo a ordem entre eles estável)
        produtosFiltrados = [...produtosFiltrados].sort(
            (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0),
        );

        // Cabeçalho com o nome da categoria (ou da busca) + botão pra voltar às categorias
        const heading = document.getElementById("products-heading");
        const nomeCategoria = categoriaAtiva
            ? (categorias.find((c) => c.id === categoriaAtiva)?.nome || "")
            : "";
        const tituloHeading = nomeCategoria || (termoBusca.trim() !== "" ? "Resultado da busca" : "");
        heading.innerHTML = `
            <button class="products-heading-voltar" id="btn-voltar-categorias" type="button">
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Categorias
            </button>
            ${tituloHeading ? `<h2 class="products-heading-titulo">${tituloHeading}</h2>` : ""}
        `;
        heading.hidden = false;

        // Renderizar produtos filtrados
        const container = document.querySelector(".products-container");
        container.classList.remove("category-tiles-view");
        if (produtosFiltrados.length === 0) {
            container.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #999;">
                            <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <p style="font-size: 1.2rem; font-weight: 600;">Nenhum produto encontrado</p>
                        </div>
                    `;
        } else {
            container.innerHTML = produtosFiltrados
                .map((p) => {
                    const tagEncomenda =
                        p.disponibilidade === "encomenda"
                            ? `<span class="product-tag tag-encomenda">Sob encomenda${p.prazoDias ? ` · ${p.prazoDias} dias` : ""}</span>`
                            : "";
                    const esgotado =
                        p.estoque !== undefined &&
                        p.estoque !== null &&
                        Number(p.estoque) <= 0;
                    const tagEsgotado = esgotado
                        ? `<span class="product-tag tag-esgotado">Esgotado</span>`
                        : "";
                    const badgeDestaque = p.destaque
                        ? `<span class="product-badge-destaque"><i class="fa-solid fa-star" aria-hidden="true"></i> Destaque</span>`
                        : "";
                    // Preço: produto com um único tamanho mostra o valor fixo; com vários
                    // tamanhos mostra "A partir de" com o menor preço cadastrado.
                    const tamanhos = tamanhosDoProduto(p);
                    const precos = tamanhos.map((t) => Number(t.preco) || 0);
                    const precoTexto = tamanhos.length > 1
                        ? `A partir de ${formatarMoeda(Math.min(...precos))}`
                        : formatarMoeda(precos[0]);
                    // Produto com qualquer tipo de personalização (tamanho, complementos,
                    // adicionais ou opção inclusa) sempre abre os detalhes pra o cliente
                    // escolher antes de ir pro carrinho — só produtos 100% simples adicionam direto.
                    const precisaDetalhe = tamanhos.length > 1
                        || (p.opcaoInclusa && Array.isArray(p.opcaoInclusa.opcoes) && p.opcaoInclusa.opcoes.length)
                        || (Array.isArray(p.complementosLista) && p.complementosLista.length && tamanhos.some(t => Number(t.complementosGratis) > 0))
                        || (Array.isArray(p.adicionaisPagos) && p.adicionaisPagos.length);
                    return `
                        <div class="product-card${esgotado ? " produto-esgotado" : ""}" data-id="${p.id}" data-precisa-detalhe="${precisaDetalhe ? "1" : ""}">
                            ${badgeDestaque}
                            <img class="product-img" src="${p.imagem}" alt="${p.nome}" loading="lazy">
                            <div class="product-info">
                                <p class="product-code">Código: ${codigoDoProduto(p)}</p>
                                <h3 class="product-name">${p.nome}</h3>
                                <p class="product-description">${p.descricao}</p>
                                ${esgotado ? tagEsgotado : tagEncomenda}
                                <p class="product-price">${precoTexto}</p>
                                <button class="product-button"${esgotado ? " disabled" : ""}>${esgotado ? "Esgotado" : (precisaDetalhe ? "Escolher" : "Adicionar ao carrinho")}</button>
                            </div>
                        </div>
                    `;
                })
                .join("");
        }
    };

    // Produtos personalizados (tamanho/opção/complementos/adicionais) geram uma "chave"
    // própria no carrinho pra cada combinação diferente, assim dá pra ter o mesmo produto
    // configurado de jeitos diferentes como itens separados. O controle de estoque continua
    // somando as quantidades de TODAS as combinações do mesmo produto, já que o estoque é
    // cadastrado por produto, não por combinação.
    const adicionarAoCarrinho = (produtoId, productCard, opcoes) => {
        const produto = produtos.find((p) => p.id === produtoId);
        if (!produto) return;
        opcoes = opcoes || {};
        const tamanho = opcoes.tamanho || null;
        const opcaoInclusa = opcoes.opcaoInclusa || null;
        const complementos = Array.isArray(opcoes.complementos) ? opcoes.complementos : [];
        const adicionais = Array.isArray(opcoes.adicionais) ? opcoes.adicionais : [];
        const preco = opcoes.preco !== undefined ? opcoes.preco : (tamanhosDoProduto(produto)[0]?.preco || Number(produto.preco) || 0);

        const chave = [
            produtoId,
            tamanho || "",
            opcaoInclusa || "",
            [...complementos].sort().join(","),
            adicionais.map((a) => a.nome).sort().join(","),
        ].join("__");

        const qtdAtualTotal = carrinho
            .filter((item) => item.id === produtoId)
            .reduce((acc, item) => acc + item.quantidade, 0);
        if (
            produto.estoque !== undefined &&
            produto.estoque !== null &&
            qtdAtualTotal + 1 > Number(produto.estoque)
        ) {
            alert(
                `Ops! Só temos ${produto.estoque} unidade(s) de "${produto.nome}" disponível(is) no momento.`,
            );
            return;
        }

        if (productCard) animacaoVoarParaCarrinho(productCard);
        const itemNoCarrinho = carrinho.find((item) => item._chave === chave);
        if (itemNoCarrinho) itemNoCarrinho.quantidade++;
        else carrinho.push({
            ...produto,
            preco,
            quantidade: 1,
            tamanhoSelecionado: tamanho,
            opcaoInclusaSelecionada: opcaoInclusa,
            complementosSelecionados: complementos,
            adicionaisSelecionados: adicionais,
            _chave: chave,
        });
        atualizarCarrinho();
    };

    // Monta a lista de personalização de um item do carrinho (tamanho, opção inclusa,
    // complementos grátis e adicionais pagos) pra reaproveitar no carrinho, no resumo e
    // na mensagem do WhatsApp.
    const detalhesDoItem = (item) => {
        const partes = [];
        if (item.tamanhoSelecionado) partes.push(item.tamanhoSelecionado);
        if (item.opcaoInclusaSelecionada) partes.push(item.opcaoInclusaSelecionada);
        if (item.complementosSelecionados?.length) partes.push(`Complementos: ${item.complementosSelecionados.join(", ")}`);
        if (item.adicionaisSelecionados?.length) partes.push(`Adicionais: ${item.adicionaisSelecionados.map(a => a.nome).join(", ")}`);
        return partes;
    };

    const alterarQuantidade = (chave, acao) => {
        const item = carrinho.find((i) => i._chave === chave);
        if (!item) return;
        if (acao === "aumentar") {
            const produto = produtos.find((p) => p.id === item.id);
            const qtdAtualTotal = carrinho
                .filter((i) => i.id === item.id)
                .reduce((acc, i) => acc + i.quantidade, 0);
            if (
                produto &&
                produto.estoque !== undefined &&
                produto.estoque !== null &&
                qtdAtualTotal + 1 > Number(produto.estoque)
            ) {
                alert(
                    `Ops! Só temos ${produto.estoque} unidade(s) de "${produto.nome}" disponível(is) no momento.`,
                );
                return;
            }
            item.quantidade++;
        } else if (acao === "diminuir") {
            item.quantidade--;
            if (item.quantidade <= 0)
                carrinho = carrinho.filter((i) => i._chave !== chave);
        }
        atualizarCarrinho();
    };

    const atualizarCarrinho = () => {
        if (carrinho.length === 0) {
            cartBody.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-box-open"></i><p>Seu carrinho está vazio.</p></div>`;
        } else {
            cartBody.innerHTML = carrinho
                .map(
                    (item) =>
                        `<div class="cart-item" data-key="${item._chave}">
                            <img src="${item.imagem}" alt="${item.nome}" class="cart-item-img">
                            <div class="cart-item-info">
                                <p class="cart-item-codigo">Código: ${codigoDoProduto(item)}</p>
                                <h4 class="cart-item-name">${item.nome}</h4>
                                ${detalhesDoItem(item).map(d => `<p class="cart-item-desc">${d}</p>`).join("")}
                                <p class="cart-item-price">${formatarMoeda(item.preco)}${item.quantidade > 1 ? ` <span class="cart-item-price-total">(${item.quantidade}x = ${formatarMoeda(item.preco * item.quantidade)})</span>` : ""}</p>
                                <div class="cart-item-controls">
                                    <button class="quantity-btn" data-action="diminuir">-</button>
                                    <span class="quantity">${item.quantidade}</span>
                                    <button class="quantity-btn" data-action="aumentar">+</button>
                                </div>
                            </div>
                            <button class="remove-item-btn">&times;</button>
                        </div>`,
                )
                .join("");
        }
        const qtdTotalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        cartItemsCountElem.textContent = `${qtdTotalItens} ${qtdTotalItens === 1 ? "item" : "itens"}`;
        const subtotal = carrinho.reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0,
        );

        if (
            appliedCoupon &&
            appliedCoupon.valorMinimo &&
            subtotal < appliedCoupon.valorMinimo
        ) {
            appliedCoupon = null;
            couponFeedback.textContent =
                "Cupom removido: o pedido não atinge mais o valor mínimo exigido.";
            couponFeedback.classList.remove("success");
            couponFeedback.classList.add("error");
        }

        const discountAmount = calcularDesconto(subtotal);
        const total = subtotal - discountAmount;
        subtotalElem.textContent = formatarMoeda(subtotal);
        if (discountAmount > 0) {
            cartDiscountElem.textContent = `- ${formatarMoeda(discountAmount)}`;
            discountLineElem.style.display = "flex";
        } else {
            discountLineElem.style.display = "none";
        }
        totalElem.textContent = formatarMoeda(total);
        cartBadge.textContent = qtdTotalItens;
        cartIconTotalElem.textContent = formatarMoeda(total);
        cartStep1TotalElem.textContent = formatarMoeda(total);
        cartNavAvancarTotalElem.textContent = `(${formatarMoeda(total)})`;
        finishOrderTotalElem.textContent = `— ${formatarMoeda(total)}`;
        cartNavAvancar.disabled = carrinho.length === 0 && etapaAtual === 1;
        finishOrderBtn.disabled = carrinho.length === 0;

        if (carrinho.length > 0 && window.innerWidth <= 768) {
            bannerTotalElem.textContent = formatarMoeda(total);
            viewCartBanner.classList.add("show");
        } else {
            viewCartBanner.classList.remove("show");
        }
    };

    const calcularDesconto = (subtotal) => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.tipo === "fixo")
            return Math.min(appliedCoupon.valor, subtotal);
        return subtotal * (appliedCoupon.valor / 100);
    };

    const applyCoupon = () => {
        const code = couponInput.value.trim().toUpperCase();
        const subtotal = carrinho.reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0,
        );
        const foundCoupon = coupons.find((c) => c.codigo === code);
        couponFeedback.classList.remove("success", "error");

        if (!foundCoupon) {
            appliedCoupon = null;
            couponFeedback.textContent = "Cupom inválido.";
            couponFeedback.classList.add("error");
        } else if (foundCoupon.ativo === false) {
            appliedCoupon = null;
            couponFeedback.textContent = "Este cupom não está mais disponível.";
            couponFeedback.classList.add("error");
        } else if (
            foundCoupon.validade &&
            new Date(`${foundCoupon.validade}T23:59:59`) < new Date()
        ) {
            appliedCoupon = null;
            couponFeedback.textContent = "Este cupom expirou.";
            couponFeedback.classList.add("error");
        } else if (
            foundCoupon.valorMinimo &&
            subtotal < foundCoupon.valorMinimo
        ) {
            appliedCoupon = null;
            couponFeedback.textContent = `Pedido mínimo de ${formatarMoeda(
                foundCoupon.valorMinimo,
            )} para usar este cupom.`;
            couponFeedback.classList.add("error");
        } else {
            appliedCoupon = foundCoupon;
            couponFeedback.textContent = "Cupom aplicado!";
            couponFeedback.classList.add("success");
        }
        atualizarCarrinho();
    };

    const finalizarPedido = () => {
        // Rede de segurança: os campos já foram validados etapa a etapa, mas confere
        // de novo aqui (ex: caso o cliente volte numa etapa pelos pontinhos e apague algo).
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const fieldsToValidate = tipoEntrega === "delivery"
            ? ["delivery-cep", "delivery-address", "identificacao-nome", "identificacao-telefone"]
            : ["pickup-date", "pickup-time", "identificacao-nome", "identificacao-telefone"];

        if (!validarCampos(fieldsToValidate)) return;

        const pedidoId = gerarIdPedido();
        const numeroWhatsApp = configLoja.whatsapp;
        const itensPedido = carrinho
            .map((item) => `  - ${item.quantidade}x [${codigoDoProduto(item)}] ${item.nome}${detalhesDoItem(item).length ? ` (${detalhesDoItem(item).join(" · ")})` : ""}`)
            .join("\n");
        const subtotal = carrinho.reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0,
        );
        const discountAmount = calcularDesconto(subtotal);
        let cupomInfo = "";
        if (appliedCoupon) {
            cupomInfo = `\n*Cupom Aplicado:* ${appliedCoupon.codigo} (${formatarMoeda(
                discountAmount,
            )})`;
        }

        const total = subtotal - discountAmount;
        let mensagem = `*-- NOVO PEDIDO ${configLoja.nomeLoja} --*\n*Nº do Pedido:* #${pedidoId}\n\n*Itens:*\n${itensPedido}\n\n*Subtotal:* ${formatarMoeda(
            subtotal,
        )}${cupomInfo}\n*Total:* ${formatarMoeda(
            total,
        )}\n\n-------------------------\n\n`;

        const paymentMethod = document.querySelector(
            'input[name="payment"]:checked',
        ).value;
        let paymentInfo = `*Forma de Pagamento:* ${paymentMethod}`;
        if (paymentMethod === "Dinheiro") {
            const troco = document.getElementById("troco-para").value;
            paymentInfo += troco
                ? ` (Troco para R$ ${troco})`
                : " (Não precisa de troco)";
        }
        const precisaTalher = document.getElementById("talher-checkbox")?.checked;
        const observacoes = document.getElementById("observacoes-input")?.value.trim();
        if (precisaTalher) paymentInfo += `\n*Colher/canudo descartável:* Sim`;
        if (observacoes) paymentInfo += `\n*Observações:* ${observacoes}`;

        const nome = document.getElementById("identificacao-nome").value;
        const telefone = document.getElementById("identificacao-telefone").value;

        if (tipoEntrega === "delivery") {
            const address = document.getElementById("delivery-address").value;
            const cep = document.getElementById("delivery-cep").value;

            mensagem += `*Tipo de Pedido:* Entrega (Moto)\n\n*Nome:* ${nome}\n*Telefone:* ${telefone}\n*CEP:* ${cep}\n*Endereço:* ${address}\n\n${paymentInfo}`;
        } else {
            const dataInput = document.getElementById("pickup-date").value;
            const hora = document.getElementById("pickup-time").value;
            const [year, month, day] = dataInput.split("-");
            const dataFormatada = `${day}/${month}/${year}`;

            mensagem += `*Tipo de Pedido:* Retirada\n\n*Nome para Retirada:* ${nome}\n*Telefone:* ${telefone}\n*Data Agendada:* ${dataFormatada}\n*Hora Agendada:* ${hora}\n\n${paymentInfo}`;
        }

        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");
        mostrarSucesso(pedidoId);
    };

    // --- EVENT LISTENERS ---
    cartIcon.addEventListener("click", abrirCarrinho);
    closeCartBtn.addEventListener("click", fecharCarrinho);
    cartOverlay.addEventListener("click", fecharCarrinho);
    applyCouponBtn.addEventListener("click", applyCoupon);
    finishOrderBtn.addEventListener("click", finalizarPedido);
    viewCartBannerBtn.addEventListener("click", abrirCarrinho);

    // Botão "voltar às categorias" acima da grade de produtos (recriado a cada render, por isso delegado)
    document.getElementById("products-heading").addEventListener("click", (e) => {
        if (!e.target.closest("#btn-voltar-categorias")) return;
        termoBusca = "";
        searchInput.value = "";
        selecionarCategoria("all");
    });

    // Event listener para campo de busca
    searchInput.addEventListener("input", (e) => {
        termoBusca = e.target.value;
        filtrarEMostrarProdutos();
    });

    document
        .querySelector(".products-container")
        .addEventListener("click", (e) => {
            const tile = e.target.closest(".category-tile");
            if (tile) {
                selecionarCategoria(tile.dataset.category);
                return;
            }
            const productCard = e.target.closest(".product-card");
            if (!productCard) return;
            const produtoId = Number.parseInt(productCard.dataset.id);
            if (e.target.matches(".product-button") && !productCard.dataset.precisaDetalhe) {
                // Produto sem nenhuma personalização (tamanho único, sem complementos/adicionais/opção)
                // adiciona direto ao carrinho, sem precisar abrir o modal.
                adicionarAoCarrinho(produtoId, productCard, {});
            } else {
                // Qualquer outro clique no card (foto, nome, descrição, ou o botão quando o
                // produto precisa de escolha) abre os detalhes pra o cliente personalizar.
                abrirDetalhe(produtoId);
            }
        });
    cartBody.addEventListener("click", (e) => {
        const cartItem = e.target.closest(".cart-item");
        if (cartItem) {
            const chave = cartItem.dataset.key;
            if (e.target.matches(".quantity-btn"))
                alterarQuantidade(chave, e.target.dataset.action);
            if (e.target.matches(".remove-item-btn")) {
                carrinho = carrinho.filter((i) => i._chave !== chave);
                atualizarCarrinho();
            }
        }
    });

    deliveryToggleBtns.forEach((btn) =>
        btn.addEventListener("click", () => {
            deliveryToggleBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            tipoEntrega = btn.dataset.option;
            if (tipoEntrega === "delivery") {
                deliveryForm.style.display = "block";
                pickupForm.style.display = "none";
            } else {
                deliveryForm.style.display = "none";
                pickupForm.style.display = "block";
            }
        }),
    );

    document.querySelectorAll('input[name="payment"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            trocoContainer.style.display =
                e.target.value === "Dinheiro" ? "block" : "none";
            document
                .querySelectorAll(".payment-option")
                .forEach((label) => label.classList.remove("selected"));
            e.target.closest(".payment-option").classList.add("selected");
        });
    });

    // Remove o erro ao digitar
    document
        .querySelectorAll(
            "#delivery-form-container input[required], #pickup-form-container input[required], #pickup-form-container select[required], #cart-step-4 input[required]",
        )
        .forEach((input) => {
            input.addEventListener("input", () => {
                if (input.value.trim() !== "") input.classList.remove("error");
            });
        });

    // Navegação entre as 5 etapas do carrinho
    cartNavAvancar.addEventListener("click", () => {
        if (!validarEtapaAtual()) return;
        if (etapaAtual < 5) mostrarEtapa(etapaAtual + 1);
    });
    cartNavVoltar.addEventListener("click", () => {
        if (etapaAtual > 1) mostrarEtapa(etapaAtual - 1);
    });
    cartStepsIndicator.addEventListener("click", (e) => {
        const dot = e.target.closest(".cart-step-dot");
        if (!dot) return;
        const step = Number(dot.dataset.step);
        if (step <= etapaMaxAlcancada) mostrarEtapa(step);
    });
    novoPedidoBtn.addEventListener("click", iniciarNovoPedido);

    // --- INICIALIZAÇÃO ---
    filtrarEMostrarProdutos();
    atualizarCarrinho();
    mostrarEtapa(1);
});
