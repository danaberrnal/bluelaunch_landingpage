# 🚀 Blue Launch — Proyecto Final F1025
### *Leyes del Movimiento y Conservación | Rocket Tec Sinaloa*
**"Innovación Digital en Órbita"**

Landing page interactiva del equipo **Blue Launch** para la entrega del proyecto final integrador de la materia de física **F1025 Leyes del Movimiento y Conservación** (Tecnológico de Monterrey).

---

## 🛰️ Características Principales del Sitio

1. **Identidad Visual Oficial de Blue Launch**:
   - Paleta de color institucional: **Azul Profundo** (`#0D183E`), **Oro Launch** (`#D4AF37`) y **Blanco Espacial** (`#FFFFFF`).
   - Logotipos vectoriales y oficiales integrados (Árbol de circuitos, satélite en órbita y cumbres doradas).
   - Tipografía aeroespacial moderna (*Space Grotesk*, *Cinzel*, *Outfit* y *JetBrains Mono*).

2. **Temporizador de Cuenta Regresiva & Secuencia de Lanzamiento con Audio**:
   - Temporizador en tiempo real con fecha objetivo al **30 de Noviembre de 2026 a las 23:59:59**.
   - Botón interactivo **"Simular Secuencia de Despegue (T-10s)"** con beeps de telemetría de frecuencia creciente, alerta de cuenta regresiva y sonido de ignición y rugido de toberas sintetizado.

3. **Música Espacial Procedural de Fondo (Web Audio API)**:
   - Sintetizador ambiental continuo generado directamente en el navegador mediante la Web Audio API (drones sub-graves, colchones de cuerdas espaciales en escala pentatónica y shimmer estelar).
   - Cero dependencias externas ni archivos MP3 caídos: funciona 100% offline y en cualquier navegador.
   - Controles de encendido/pausa, deslizador de volumen y **ecualizador visual animado en vivo**.

4. **Laboratorio y Simulador Físico F1025**:
   - Motor de integración numérica de trayectoria suborbital (método Euler/Runge-Kutta).
   - Controles deslizantes para variar el empuje del motor ($T$), masa seca ($m_0$), masa de combustible ($m_f$), tasa de consumo ($\dot{m}$), coeficiente de arrastre aerodinámico ($C_d$) y gravedad planetaria (Tierra, Marte, Luna).
   - Gráficos y telemetría en tiempo real: altitud, velocidad Mach, aceleración en $g$, combustible restante y cálculo instantáneo del $\Delta v$ de Konstantin Tsiolkovsky ($\Delta v = v_e \ln(m_0/m_f)$).

5. **Fundamentos Físicos de F1025**:
   - Desarrollo analítico de las **3 Leyes de Newton** para sistemas de masa variable.
   - Conservación del **Momentum Lineal** y derivación de la ecuación del cohete.
   - Balances de **Conservación de la Energía Mecánica** y pérdidas disipativas por arrastre ($W_{drag}$).
   - Modelo gravitatorio con variación de altitud $g(h)$.

6. **Consola Interactiva de Telemetría (Mission Terminal)**:
   - Terminal retro-futurista con soporte para comandos como `status`, `telemetry`, `laws`, `launch`, `tsiolkovsky`, `team` y `clear`.

7. **Módulo de Entregables**:
   - Acceso al reporte técnico formal, script de simulación en Python (.py), dataset de telemetría en CSV y archivo `.zip` para publicación.

---

## 🌐 Cómo Publicar este Sitio en GitHub Pages (Paso a Paso)

Este proyecto está diseñado en HTML5, CSS3 y JavaScript vanilla estándar, por lo que **no requiere ningún comando de compilación (npm, webpack o vite)**. Se publica directamente en 3 sencillos pasos:

### Opción A: Desde la interfaz web de GitHub (Sin instalar nada)

1. **Crear el repositorio en GitHub**:
   - Entra a [GitHub.com](https://github.com) e inicia sesión.
   - Haz clic en el botón verde **"New"** (Nuevo repositorio).
   - Nómbralo por ejemplo: `blue-launch-f1025` o `rocket-tec-sinaloa`.
   - Selecciona **Public** (Público) y haz clic en **"Create repository"**.

2. **Subir los archivos del proyecto**:
   - Descomprime el archivo `blue-launch-f1025-github-pages.zip`.
   - En la página de tu repositorio en GitHub, haz clic en **"uploading an existing file"** (subir archivos existentes).
   - Arrastra y suelta todos los archivos y carpetas extraídos:
     - `index.html`
     - `style.css`
     - `script.js`
     - Carpeta `assets/` (con los logos e imágenes)
     - `README.md`
   - En la parte inferior, escribe un mensaje de commit (ejemplo: *"Despliegue inicial de Blue Launch"*) y haz clic en **"Commit changes"**.

3. **Activar GitHub Pages**:
   - En la parte superior de tu repositorio, haz clic en **Settings** (Configuración ⚙️).
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - Bajo la sección **"Build and deployment"**:
     - **Source**: Selecciona `Deploy from a branch`.
     - **Branch**: Selecciona `main` (o `master`) y la carpeta `/ (root)`.
     - Haz clic en **Save** (Guardar).
   - En 1 o 2 minutos, GitHub generará tu enlace público (ejemplo: `https://tu-usuario.github.io/blue-launch-f1025/`). ¡Listo!

---

### Opción B: Mediante Git en tu Terminal

```bash
# 1. Descomprime el archivo zip y entra a la carpeta
cd blue-launch-landing

# 2. Inicializa git
git init
git add .
git commit -m "🚀 Proyecto Final Blue Launch F1025"

# 3. Vincula con tu repositorio de GitHub
git branch -M main
git remote add origin https://github.com/TU-USUARIO/blue-launch-f1025.git

# 4. Sube los cambios
git push -u origin main
```

Luego ve a **Settings** > **Pages** en GitHub y activa la rama `main` en la raíz `/ (root)`.

---

## 📁 Estructura del Proyecto

```text
├── index.html         # Página principal estructurada y accesible
├── style.css          # Estilos CSS, diseño glassmorphism, responsive design
├── script.js          # Web Audio synth, simulador físico F1025, cuenta regresiva
├── README.md          # Documentación e instrucciones de publicación
└── assets/            # Recursos gráficos oficiales de Blue Launch
    ├── logo-horizontal.jpg       # Logotipo horizontal con lema oficial
    ├── logo-circular.jpg         # Emblema circular oficial de misión
    ├── poster-identidad-web.jpg  # Manual de identidad optimizado para web
    └── poster-identidad-hd.jpg   # Manual de identidad en resolución HD
```

---

## 👥 Equipo Rocket Tec Sinaloa

- **Materia**: F1025 Leyes del Movimiento y Conservación
- **Institución**: Tecnológico de Monterrey — Campus Sinaloa
- **Fecha de Entrega**: Noviembre 2026
