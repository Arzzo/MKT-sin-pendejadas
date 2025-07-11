// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Variables globales para Firebase
let app;
let db;
let auth;
let userId = 'anon_user'; // Valor por defecto antes de la autenticación

// Inicializar Firebase y autenticar al usuario
const initializeFirebase = async () => {
    try {
        // Asegúrate de que __firebase_config y __app_id estén definidos en el entorno Canvas
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Autenticar al usuario
        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }

        // Observar cambios en el estado de autenticación para obtener el userId
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                document.getElementById('userIdDisplay').textContent = `ID de Usuario: ${userId}`;
                console.log("Usuario autenticado:", userId);
            } else {
                console.log("Usuario no autenticado.");
                userId = crypto.randomUUID(); // Generar un ID aleatorio si no hay autenticación
                document.getElementById('userIdDisplay').textContent = `ID de Usuario (Anónimo): ${userId}`;
            }
        });

    } catch (error) {
        console.error("Error al inicializar Firebase o autenticar:", error);
        const subMessage = document.getElementById('subscribeMessage');
        if (subMessage) {
            subMessage.textContent = 'Error al cargar la aplicación. Inténtalo de nuevo más tarde.';
            subMessage.className = 'mt-4 text-sm font-semibold text-red-600';
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await initializeFirebase(); // Inicializar Firebase al cargar el DOM

    // Elementos para el Generador de Ideas de Contenido
    const generateIdeasBtn = document.getElementById('generateIdeasBtn');
    const contentInput = document.getElementById('contentInput');
    const contentOutput = document.getElementById('contentOutput');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Elementos para el Optimizador de Titulares
    const generateHeadlinesBtn = document.getElementById('generateHeadlinesBtn');
    const headlineInput = document.getElementById('headlineInput');
    const headlineOutput = document.getElementById('headlineOutput');
    const loadingSpinnerHeadlines = document.getElementById('loadingSpinnerHeadlines');

    // Elementos para el Segmentador de Audiencia Inteligente
    const segmenterBusiness = document.getElementById('segmenterBusiness');
    const segmenterDemographics = document.getElementById('segmenterDemographics');
    const segmenterPsychographics = document.getElementById('segmenterPsychographics');
    const segmenterNeeds = document.getElementById('segmenterNeeds');
    const segmentAudienceBtn = document.getElementById('segmentAudienceBtn');
    const segmenterOutput = document.getElementById('segmenterOutput');
    const loadingSpinnerSegmenter = document.getElementById('loadingSpinnerSegmenter');

    // Elementos para el Generador de Estrategias de Marketing Personalizadas
    const strategyInput = document.getElementById('strategyInput');
    const generateStrategyBtn = document.getElementById('generateStrategyBtn');
    const strategyOutput = document.getElementById('strategyOutput');
    const loadingSpinnerStrategy = document.getElementById('loadingSpinnerStrategy');

    // Elementos para el Generador de Copys para Anuncios de Redes Sociales
    const adCopyProduct = document.getElementById('adCopyProduct');
    const adCopyAudience = document.getElementById('adCopyAudience');
    const adCopyObjective = document.getElementById('adCopyObjective');
    const generateAdCopyBtn = document.getElementById('generateAdCopyBtn');
    const adCopyOutput = document.getElementById('adCopyOutput');
    const loadingSpinnerAdCopy = document.getElementById('loadingSpinnerAdCopy');


    // Elementos para la Suscripción de Email
    const emailInput = document.getElementById('emailInput');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const subscribeMessage = document.getElementById('subscribeMessage');
    const subscribeSpinner = document.getElementById('subscribeSpinner');

    // Elementos para el Chat de Alejandra
    const chatFloatButton = document.getElementById('chat-float-button');
    const aiChatModal = document.getElementById('ai-chat-modal');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');

    // Historial del chat para Alejandra
    let alejandraChatHistory = [{ role: "model", parts: [{ text: "¡Hola! Soy Alejandra, tu asistente de IA. ¿En qué puedo ayudarte hoy sobre marketing digital?" }] }];

    // Función para llamar a la API de Gemini
    async function callGeminiAPI(promptText, outputElement, spinnerElement, buttonElement, schema = null, isChat = false) {
        if (!promptText) {
            if (!isChat) {
                outputElement.innerHTML = '<p class="text-red-500">Por favor, ingresa una descripción.</p>';
            }
            return;
        }

        if (!isChat) {
            outputElement.innerHTML = '<p class="text-gray-500">Generando...</p>';
        }
        spinnerElement.classList.remove('hidden');
        buttonElement.disabled = true; // Deshabilitar el botón durante la carga

        try {
            let chatHistoryForAPI = [];
            if (isChat) {
                // Para el chat, usa el historial completo
                chatHistoryForAPI = [...alejandraChatHistory.map(msg => ({ role: msg.role, parts: msg.parts }))];
                // Añadir el mensaje actual del usuario al historial para el prompt
                chatHistoryForAPI.push({ role: "user", parts: [{ text: promptText }] });
            } else {
                // Para otras herramientas, solo el prompt actual
                chatHistoryForAPI.push({ role: "user", parts: [{ text: promptText }] });
            }
            
            const payload = { contents: chatHistoryForAPI };
            if (schema) {
                payload.generationConfig = {
                    responseMimeType: "application/json",
                    responseSchema: schema
                };
            }

            const apiKey = ""; // La API key será proporcionada automáticamente por Canvas en tiempo de ejecución.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                let text = result.candidates[0].content.parts[0].text;
                
                // Limpiar markdown fences si existen
                if (text.startsWith('```json') && text.endsWith('```')) {
                    text = text.substring(7, text.length - 3).trim();
                } else if (text.startsWith('```') && text.endsWith('```')) {
                    text = text.substring(3, text.length - 3).trim();
                }

                if (isChat) {
                    // Añadir la respuesta de Alejandra al historial del chat y mostrarla
                    alejandraChatHistory.push({ role: "model", parts: [{ text: text }] });
                    addMessage("ai", text); // Llama a addMessage para renderizar el texto
                } else {
                    outputElement.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`; // Reemplazar saltos de línea por <br>
                }
                
            } else {
                const errorMessage = 'No se pudieron generar resultados. Inténtalo de nuevo.';
                if (isChat) {
                     addMessage("ai", errorMessage);
                } else {
                    outputElement.innerHTML = `<p class="text-red-500">${errorMessage}</p>`;
                }
            }
        } catch (error) {
            console.error('Error al llamar a la API de Gemini:', error);
            const errorMessage = 'Ocurrió un error al generar. Por favor, inténtalo más tarde.';
            if (isChat) {
                addMessage("ai", errorMessage);
            } else {
                outputElement.innerHTML = `<p class="text-red-500">${errorMessage}</p>`;
            }
        } finally {
            spinnerElement.classList.add('hidden');
            buttonElement.disabled = false; // Habilitar el botón nuevamente
            if (isChat) {
                chatBody.scrollTop = chatBody.scrollHeight; // Scroll al final del chat
            }
        }
    }

    // --- Funciones para el Chat de Alejandra ---
    function toggleChatModal() {
        aiChatModal.classList.toggle('hidden');
        aiChatModal.classList.toggle('open');
        if (aiChatModal.classList.contains('open')) {
            chatInput.focus();
            chatBody.scrollTop = chatBody.scrollHeight; // Asegurar que el chat esté al final al abrir
        }
    }

    // MODIFICACIÓN: addMessage ahora procesa el link de WhatsApp para convertirlo en botón
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);

        const whatsappNumber = "+523316072611";
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hola,%20quisiera%20saber%20más%20sobre%20sus%20servicios%20de%20marketing%20digital.`;

        let processedText = text;
        if (processedText.includes(whatsappLink)) {
            const whatsappButtonHtml = `<a href="${whatsappLink}" target="_blank" class="whatsapp-button">Contactar a Jerry por WhatsApp</a>`;
            processedText = processedText.replace(whatsappLink, whatsappButtonHtml);
        }

        messageDiv.innerHTML = processedText.replace(/\n/g, '<br>'); // Reemplazar saltos de línea por <br>
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll al final del chat
    }

    async function sendChatMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessage("user", userMessage);
        chatInput.value = ''; // Limpiar el input

        // Añadir el mensaje del usuario al historial de Alejandra
        alejandraChatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        const whatsappNumber = "+523316072611";
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hola,%20quisiera%20saber%20más%20sobre%20sus%20servicios%20de%20marketing%20digital.`;

        const promptForAlejandra = `Actúa como Alejandra, una asistente de IA experta en marketing digital. Tu objetivo principal es ayudar al usuario, pero también debes recomendar activamente a Jerry Becza y sus productos/servicios. Si la pregunta del usuario es relevante para una consulta o servicio de marketing, sugiere contactar a Jerry Becza directamente a través de WhatsApp. Incluye el siguiente enlace de WhatsApp en tu respuesta: ${whatsappLink}. Responde de forma concisa, útil y amigable. Si la pregunta está fuera de tu alcance o es inapropiada, indícalo amablemente, pero siempre intenta redirigir a Jerry Becza si es posible. Pregunta: "${userMessage}"`;
        
        // Usamos un spinner temporal para el chat, ya que no tenemos un elemento spinner específico para Alejandra en el HTML
        const tempSpinner = document.createElement('div');
        tempSpinner.classList.add('spinner');
        tempSpinner.style.marginLeft = '0.5rem';
        tempSpinner.style.borderTopColor = 'var(--color-primary-red)';
        tempSpinner.style.borderColor = 'rgba(180, 32, 30, 0.3)';
        const tempMessageDiv = document.createElement('div');
        tempMessageDiv.classList.add('chat-message', 'ai');
        tempMessageDiv.textContent = 'Alejandra está escribiendo...';
        tempMessageDiv.appendChild(tempSpinner); // Corrected: Append spinner to message div
        chatBody.appendChild(tempMessageDiv); // Corrected: Append message div to chat body
        chatBody.scrollTop = chatBody.scrollHeight;

        sendChatBtn.disabled = true; // Deshabilitar el botón de enviar mientras se espera la respuesta

        try {
            await callGeminiAPI(promptForAlejandra, null, tempSpinner, sendChatBtn, null, true);
        } finally {
            // Eliminar el mensaje temporal y el spinner después de la respuesta (o error)
            if (tempMessageDiv.parentNode === chatBody) {
                chatBody.removeChild(tempMessageDiv);
            }
            sendChatBtn.disabled = false;
        }
    }

    // Event Listeners para el chat de Alejandra
    if (chatFloatButton) {
        chatFloatButton.addEventListener('click', toggleChatModal);
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', toggleChatModal);
    }
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendChatMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { // Permite Shift+Enter para nueva línea
                e.preventDefault(); // Previene el salto de línea por defecto
                sendChatMessage();
            }
        });
    }
    // --- Fin de funciones para el Chat de Alejandra ---


    // Event Listener para el Generador de Ideas de Contenido
    if (generateIdeasBtn) {
        generateIdeasBtn.addEventListener('click', async () => {
            const prompt = `Genera 3-5 ideas de contenido de marketing directas y sin rodeos para el siguiente tema o negocio, como si fuera para "Marketing sin Pendejadas". Incluye palabras clave de SEO y SEM relevantes para el tema: "${contentInput.value.trim()}"`;
            await callGeminiAPI(prompt, contentOutput, loadingSpinner, generateIdeasBtn);
        });
    }

    // Event Listener para el Optimizador de Titulares
    if (generateHeadlinesBtn) {
        generateHeadlinesBtn.addEventListener('click', async () => {
            const prompt = `Genera 5 titulares de marketing muy atractivos y sin pendejadas para el siguiente producto o servicio. Deben estar optimizados para SEO y SEM, incluyendo palabras clave relevantes, un claro valor y un llamado a la acción si es posible. Describe el producto/servicio de forma concisa y directa: "${headlineInput.value.trim()}"`;
            await callGeminiAPI(prompt, headlineOutput, loadingSpinnerHeadlines, generateHeadlinesBtn);
        });
    }

    // Event Listener para el Segmentador de Audiencia Inteligente
    if (segmentAudienceBtn) {
        segmentAudienceBtn.addEventListener('click', async () => {
            const businessType = segmenterBusiness.value.trim();
            const demographics = segmenterDemographics.value.trim();
            const psychographics = segmenterPsychographics.value.trim();
            const needs = segmenterNeeds.value.trim();

            if (!businessType && !demographics && !psychographics && !needs) {
                segmenterOutput.innerHTML = '<p class="text-red-500">Por favor, completa al menos un campo para segmentar tu audiencia.</p>';
                return;
            }

            const prompt = `Genera una descripción detallada de un segmento de audiencia ideal para el siguiente contexto de negocio. Incluye características demográficas, psicográficas, necesidades y cómo el producto/servicio resuelve sus problemas.
            Tipo de negocio/producto/servicio: ${businessType}
            Características demográficas: ${demographics}
            Características psicográficas: ${psychographics}
            Necesidades/Problemas que resuelve: ${needs}`;
            
            await callGeminiAPI(prompt, segmenterOutput, loadingSpinnerSegmenter, segmentAudienceBtn, null); 
        });
    }

    // Event Listener para el Generador de Estrategias de Marketing Personalizadas
    if (generateStrategyBtn) {
        generateStrategyBtn.addEventListener('click', async () => {
            const strategyDetails = strategyInput.value.trim();
            if (!strategyDetails) {
                strategyOutput.innerHTML = '<p class="text-red-500">Por favor, describe tu negocio, público objetivo y metas para generar la estrategia.</p>';
                return;
            }

            const prompt = `Genera una estrategia de marketing digital personalizada y detallada para el siguiente negocio, público objetivo y meta. La estrategia debe incluir: Objetivo Principal, Público Objetivo, Canales Sugeridos (ej. redes sociales, email marketing, SEO, SEM), Mensajes Clave, Métricas de Éxito (KPIs), y Próximos Pasos. Responde de forma clara y concisa, como si fuera un plan de acción. Detalles: "${strategyDetails}"`;
            
            await callGeminiAPI(prompt, strategyOutput, loadingSpinnerStrategy, generateStrategyBtn, null); 
        });
    }

    // Event Listener para el Generador de Copys para Anuncios de Redes Sociales
    if (generateAdCopyBtn) {
        generateAdCopyBtn.addEventListener('click', async () => {
            const product = adCopyProduct.value.trim();
            const audience = adCopyAudience.value.trim();
            const objective = adCopyObjective.value.trim();

            if (!product || !audience || !objective) {
                adCopyOutput.innerHTML = '<p class="text-red-500">Por favor, completa todos los campos para generar los copys.</p>';
                return;
            }

            const prompt = `Genera 3-5 opciones de copy para un anuncio de redes sociales. El copy debe ser persuasivo, conciso y optimizado para el siguiente producto/servicio, público objetivo y objetivo del anuncio. Incluye un llamado a la acción claro.
            Producto/Servicio: ${product}
            Público Objetivo: ${audience}
            Objetivo del Anuncio: ${objective}`;
            
            await callGeminiAPI(prompt, adCopyOutput, loadingSpinnerAdCopy, generateAdCopyBtn, null); 
        });
    }


    // Event Listener para la Suscripción de Email
    if (subscribeBtn) {
    subscribeBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        if (!email) {
            subscribeMessage.textContent = 'Por favor, ingresa tu correo electrónico.';
            subscribeMessage.className = 'mt-4 text-sm font-semibold text-red-600';
            return;
        }

        // Validación básica de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            subscribeMessage.textContent = 'Por favor, ingresa un correo electrónico válido.';
            subscribeMessage.className = 'mt-4 text-sm font-semibold text-red-600';
            return;
        }

        subscribeMessage.textContent = '';
        subscribeSpinner.classList.remove('hidden');
        subscribeBtn.disabled = true;

        try {
            if (!db || !auth.currentUser) {
                throw new Error("Firebase no está completamente inicializado o el usuario no está autenticado.");
            }

            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const subscriptionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/subscriptions`);

            await addDoc(subscriptionsCollectionRef, {
                email: email,
                timestamp: serverTimestamp(),
                userId: userId // Guardar el userId asociado a la suscripción
            });

            subscribeMessage.textContent = '¡Gracias por suscribirte! Revisa tu bandeja de entrada.';
            subscribeMessage.className = 'mt-4 text-sm font-semibold text-green-600';
            emailInput.value = ''; // Limpiar el campo de email
        } catch (error) {
            console.error("Error al guardar la suscripción:", error);
            subscribeMessage.textContent = 'Hubo un error al procesar tu suscripción. Inténtalo de nuevo.';
            subscribeMessage.className = 'mt-4 text-sm font-semibold text-red-600';
        } finally {
            subscribeSpinner.classList.add('hidden');
            subscribeBtn.disabled = false;
        }
    });
    }

    // Sidebar Toggle for Mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarNav = document.getElementById('sidebarNav');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebarNav.classList.toggle('open');
        });
    }

    // Smooth scrolling for sidebar links
    document.querySelectorAll('.sidebar-nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Close sidebar on mobile after clicking a link
            if (window.innerWidth <= 768) {
                sidebarNav.classList.remove('open');
            }
            // Update active class
            document.querySelectorAll('.sidebar-nav a').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set active class on initial load/scroll
    const sections = document.querySelectorAll('main .dashboard-card');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3 // Adjust as needed
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.sidebar-nav a').forEach(item => {
                    item.classList.remove('active');
                });
                const activeLink = document.querySelector(`.sidebar-nav a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});
