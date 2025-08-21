/**
 * @fileoverview Logo y recursos gráficos de la aplicación FIDO
 * 
 * Este archivo contiene el logo de la aplicación en diferentes formatos:
 * - Base64 para uso directo en HTML
 * - Componente React SVG para renderizado dinámico
 * - Función para generar datos de imagen para canvas/PDF
 * 
 * El diseño del logo representa una mascota estilizada con colores
 * corporativos y elementos gráficos que reflejan la identidad de FIDO.
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

/**
 * Logo de la empresa en formato base64
 * Útil para uso directo en elementos <img> o CSS
 * 
 * @type {string}
 * @constant
 */
export const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMDAgMTAwSDQwMFY0MDBIMTAwVjEwMFoiIGZpbGw9IiNGRjY1MDAiLz4KPHBhdGggZD0iTTE1MCAyMDBIMzUwVjMwMEgxNTBWMjAwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K";

/**
 * Componente React del logo como SVG
 * 
 * Renderiza el logo de FIDO como un SVG escalable con la representación
 * estilizada de una mascota. Incluye elementos como orejas, cuerpo principal,
 * mancha blanca en el pecho y cola.
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {number} [props.width=40] - Ancho del logo en píxeles
 * @param {number} [props.height=40] - Alto del logo en píxeles
 * @param {string} [props.className=""] - Clases CSS adicionales
 * @returns {JSX.Element} Elemento SVG del logo
 * 
 * @example
 * <LogoSVG width={60} height={60} className="mx-auto" />
 */
export const LogoSVG = ({ width = 40, height = 40, className = "" }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 500 500" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Forma principal del perro */}
    <path 
      d="M50 150 
         C 50 100, 100 50, 150 50
         L 350 50
         C 400 50, 450 100, 450 150
         L 450 200
         C 450 180, 430 160, 400 160
         L 380 160
         C 380 180, 360 200, 340 200
         L 160 200
         C 140 200, 120 180, 120 160
         L 100 160
         C 70 160, 50 180, 50 200
         L 50 250
         C 50 300, 100 350, 150 350
         L 200 350
         L 200 400
         C 200 430, 220 450, 250 450
         C 280 450, 300 430, 300 400
         L 300 350
         L 350 350
         C 400 350, 450 300, 450 250
         L 450 350
         C 450 400, 400 450, 350 450
         L 150 450
         C 100 450, 50 400, 50 350
         Z" 
      fill="#FF6500"
    />
    
    {/* Oreja derecha */}
    <ellipse cx="380" cy="120" rx="25" ry="40" fill="#2D1810" transform="rotate(-15 380 120)"/>
    
    {/* Detalle blanco en el pecho */}
    <path 
      d="M 150 220
         C 170 200, 200 200, 220 220
         L 280 220
         C 300 200, 330 200, 350 220
         L 350 320
         C 350 340, 330 360, 310 360
         L 190 360
         C 170 360, 150 340, 150 320
         Z" 
      fill="#FFFFFF"
    />
    
    {/* Cola */}
    <path 
      d="M 450 300
         C 470 310, 480 330, 475 350
         C 470 370, 450 380, 430 375
         C 440 360, 445 340, 450 320
         Z" 
      fill="#FF6500"
    />
  </svg>
);

/**
 * Genera datos de imagen del logo para uso en canvas o generación de PDF
 * 
 * Convierte el logo SVG a un DataURL en formato PNG que puede ser utilizado
 * en contextos donde se requiere una imagen bitmap, como canvas HTML5 o
 * bibliotecas de generación de PDF.
 * 
 * @async
 * @function getLogoImageData
 * @returns {Promise<string>} DataURL de la imagen en formato PNG
 * 
 * @example
 * const logoData = await getLogoImageData();
 * // Usar logoData en canvas: ctx.drawImage(img, 0, 0);
 * // Usar logoData en PDF: doc.addImage(logoData, 'PNG', x, y, width, height);
 */
export const getLogoImageData = () => {
  return new Promise((resolve) => {
    // SVG del logo con dimensiones fijas para canvas
    const svg = `
      <svg width="120" height="120" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 150 
           C 50 100, 100 50, 150 50
           L 350 50
           C 400 50, 450 100, 450 150
           L 450 200
           C 450 180, 430 160, 400 160
           L 380 160
           C 380 180, 360 200, 340 200
           L 160 200
           C 140 200, 120 180, 120 160
           L 100 160
           C 70 160, 50 180, 50 200
           L 50 250
           C 50 300, 100 350, 150 350
           L 200 350
           L 200 400
           C 200 430, 220 450, 250 450
           C 280 450, 300 430, 300 400
           L 300 350
           L 350 350
           C 400 350, 450 300, 450 250
           L 450 350
           C 450 400, 400 450, 350 450
           L 150 450
           C 100 450, 50 400, 50 350
           Z" 
          fill="#FF6500"/>
        <ellipse cx="380" cy="120" rx="25" ry="40" fill="#2D1810" transform="rotate(-15 380 120)"/>
        <path d="M 150 220
           C 170 200, 200 200, 220 220
           L 280 220
           C 300 200, 330 200, 350 220
           L 350 320
           C 350 340, 330 360, 310 360
           L 190 360
           C 170 360, 150 340, 150 320
           Z" 
          fill="#FFFFFF"/>
        <path d="M 450 300
           C 470 310, 480 330, 475 350
           C 470 370, 450 380, 430 375
           C 440 360, 445 340, 450 320
           Z" 
          fill="#FF6500"/>
      </svg>
    `;
    
    // Crear canvas para convertir SVG a imagen
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 120, 120);
      resolve(canvas.toDataURL('image/png'));
    };
    
    // Convertir SVG a blob y crear URL
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.src = url;
  });
};
