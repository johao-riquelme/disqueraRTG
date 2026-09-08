// 1. Cargar el carrito guardado en localStorage (o iniciar un arreglo vacío si no existe nada)
let carrito = JSON.parse(localStorage.getItem('carrito_reyes')) || [];
let productoSeleccionadoModal = null;

// Espera a que se cargue la estructura del DOM
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar los productos que ya estaban guardados previamente
    actualizarCarritoUI();

    // 2. Asignar evento 'click' a los botones "Agregar al Carrito" directos
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita abrir el modal al presionar directamente el botón
            const nombre = boton.getAttribute('data-nombre');
            const precio = parseFloat(boton.getAttribute('data-precio'));
            agregarAlCarrito(nombre, precio);
        });
    });

    // 3. Asignar evento al botón "Agregar al Carrito" dentro del Modal de detalle
    const btnModal = document.getElementById('btnAgregarDesdeModal');
    if (btnModal) {
        btnModal.addEventListener('click', () => {
            if (productoSeleccionadoModal) {
                agregarAlCarrito(productoSeleccionadoModal.nombre, productoSeleccionadoModal.precio);
            }
        });
    }

    // 4. Asignar evento al botón Proceder al Pago
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
            } else {
                alert("¡Gracias por tu compra! Tu orden ha sido procesada.");
                carrito = [];
                guardarCarritoStorage();
                actualizarCarritoUI();
                const modalEl = document.getElementById('modalCarrito');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
        });
    }
});

// Función para guardar el estado actual del carrito en localStorage
function guardarCarritoStorage() {
    localStorage.setItem('carrito_reyes', JSON.stringify(carrito));
}

// Función invocada desde el atributo onclick de la tarjeta
function prepararModal(nombre, precio, imagenUrl, descripcion) {
    const floatPrecio = parseFloat(precio);
    productoSeleccionadoModal = { nombre, precio: floatPrecio };

    document.getElementById('detalleTitulo').innerText = nombre;
    document.getElementById('detalleImagen').src = imagenUrl;
    document.getElementById('detalleDescripcion').innerText = descripcion;
    document.getElementById('detallePrecio').innerText = `$${floatPrecio.toLocaleString('en-US')} USD`;
}

// Función para añadir productos al array
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    guardarCarritoStorage(); // Persistir cambios
    actualizarCarritoUI();
}

// Función para actualizar la interfaz gráfica del Carrito y el Contador
function actualizarCarritoUI() {
    const countSpan = document.getElementById('cart-count');
    const listaUI = document.getElementById('lista-carrito');
    const totalUI = document.getElementById('total-carrito');

    if (countSpan) countSpan.innerText = carrito.length;

    if (listaUI) {
        listaUI.innerHTML = '';
        let total = 0;

        carrito.forEach((prod, index) => {
            total += prod.precio;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-secondary';
            li.innerHTML = `
                <span>${prod.nombre} - $${prod.precio.toLocaleString('en-US')} USD</span>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${index})">✕</button>
            `;
            listaUI.appendChild(li);
        });

        if (totalUI) totalUI.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
}

// Función para remover un producto del carrito según su índice
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarritoStorage(); // Persistir cambios
    actualizarCarritoUI();
}