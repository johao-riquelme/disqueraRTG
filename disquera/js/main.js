let carrito = JSON.parse(localStorage.getItem('carrito_reyes')) || [];
let productoSeleccionadoModal = null;

document.addEventListener('DOMContentLoaded', () => {

    actualizarCarritoUI();

    const contenedorPlanes = document.getElementById('contenedor-planes');
    const contenedorMicrofonos = document.getElementById('contenedor-microfonos');

    if (contenedorPlanes) {
        cargarPlanes();
    } else if (contenedorMicrofonos) {
        cargarProductos();
    }

    const btnModal = document.getElementById('btnAgregarDesdeModal');
    if (btnModal) {
        btnModal.addEventListener('click', () => {
            if (productoSeleccionadoModal) {
                agregarAlCarrito(productoSeleccionadoModal.nombre, productoSeleccionadoModal.precio);
            }
        });
    }

    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', () => {
            if (carrito.length === 0) {
                mostrarAlertaCarrito("Tu carrito está vacío.", "warning");
                return;
            }

            const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

            if (!usuarioActivo) {

                mostrarAlertaCarrito("Debes iniciar sesión para poder procesar tu compra. Redirigiendo...", "danger");

                setTimeout(() => {
                    const modalEl = document.getElementById('modalCarrito');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();

                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            console.clear(); 
            console.log("     THE REYES RECORDS");
            console.log("========================================");
            console.log(`Cliente: ${usuarioActivo.nombre} (${usuarioActivo.email})`);
            console.log("----------------------------------------");
            
            let totalBoleta = 0;
            carrito.forEach((prod, index) => {
                console.log(`${index + 1}. ${prod.nombre} ---- $${prod.precio.toLocaleString('en-US')} USD`);
                totalBoleta += prod.precio;
            });

            console.log("------------------------------------------");
            console.log(`TOTAL PAGADO: $${totalBoleta.toLocaleString('en-US')} USD`);
            console.log("==========================================");
            console.log("¡Gracias por tu compra en The Reyes Records!");

            mostrarAlertaCarrito(`¡Gracias por tu compra, ${usuarioActivo.nombre}! Pedido procesado con éxito.`, "success");
            carrito = [];
            guardarCarritoStorage();
            actualizarCarritoUI();

            setTimeout(() => {
                const modalEl = document.getElementById('modalCarrito');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }, 2500);
        });
    }

    const formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombreRegistro')?.value.trim();
            const email = document.getElementById('emailRegistro')?.value.trim();
            const pass = document.getElementById('passRegistro')?.value;
            const confirmPass = document.getElementById('confirmPassRegistro')?.value;
            const contenedorMensaje = document.getElementById('mensaje-status');

            if (pass !== confirmPass) {
                mostrarMensaje(contenedorMensaje, 'Las contraseñas no coinciden.', 'danger');
                return;
            }

            let usuarios = JSON.parse(localStorage.getItem('usuarios_reyes')) || [];
            
            if (usuarios.some(u => u.email === email)) {
                mostrarMensaje(contenedorMensaje, 'Este correo ya está registrado.', 'warning');
                return;
            }

            usuarios.push({ nombre, email, pass });
            localStorage.setItem('usuarios_reyes', JSON.stringify(usuarios));
            
            mostrarMensaje(contenedorMensaje, '¡Registro completado con éxito! Redirigiendo al inicio de sesión...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('emailLogin')?.value.trim();
            const pass = document.getElementById('passLogin')?.value;
            const contenedorMensaje = document.getElementById('mensaje-status');

            let usuarios = JSON.parse(localStorage.getItem('usuarios_reyes')) || [];
            const usuarioValido = usuarios.find(u => u.email === email && u.pass === pass);

            if (usuarioValido) {
                localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));
                mostrarMensaje(contenedorMensaje, `¡Inicio de sesión completado! Bienvenido, ${usuarioValido.nombre}.`, 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1800);
            } else {
                mostrarMensaje(contenedorMensaje, 'Correo o contraseña incorrectos.', 'danger');
            }
        });
    }

    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuarioActivo) {
        const btnLogin = document.querySelector('a[href="login.html"]');
        const btnRegistro = document.querySelector('a[href="registro.html"]');
        
        if (btnLogin) {
            btnLogin.innerHTML = `<i class="bi bi-person-check-fill"></i> ${usuarioActivo.nombre}`;
            btnLogin.href = '#';
        }
        if (btnRegistro) {
            btnRegistro.textContent = 'Cerrar Sesión';
            btnRegistro.href = '#';
            btnRegistro.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('usuarioActivo');
                window.location.reload();
            });
        }
    }
});

function guardarCarritoStorage() {
    localStorage.setItem('carrito_reyes', JSON.stringify(carrito));
}

function prepararModal(nombre, precio, imagenUrl, descripcion) {
    const floatPrecio = parseFloat(precio);
    productoSeleccionadoModal = { nombre, precio: floatPrecio };

    document.getElementById('detalleTitulo').innerText = nombre;
    document.getElementById('detalleImagen').src = imagenUrl;
    document.getElementById('detalleDescripcion').innerText = descripcion;
    document.getElementById('detallePrecio').innerText = `$${floatPrecio.toLocaleString('en-US')} USD`;
}

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    guardarCarritoStorage();
    actualizarCarritoUI();
}

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

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarritoStorage();
    actualizarCarritoUI();
}


async function cargarPlanes() {
    try {
        const respuesta = await fetch(`data/planes.json?v=${new Date().getTime()}`);
        const planes = await respuesta.json();
        
        const contenedor = document.getElementById('contenedor-planes');
        let htmlPlanes = '';

        planes.forEach(plan => {
            htmlPlanes += `
                <div class="col-12 col-sm-6 col-md-3 d-flex justify-content-center">
                    <div class="card rr disco-card h-100 tarjeta-modal" style="width: 18rem; cursor: pointer;" 
                         data-nombre="${plan.nombre}"
                         data-precio="${plan.precio}"
                         data-imagen="${plan.imagen}"
                         data-descripcion="${plan.descripcion}">
                        <img src="${plan.imagen}" class="card-img-top p-2" alt="${plan.nombre}">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="card-title">${plan.nombre}</h5>
                                <p class="card-text mb-3"><strong>Valor $${typeof plan.precio === 'number' ? plan.precio.toLocaleString('en-US') : plan.precio} USD</strong></p>
                            </div>
                            <button type="button" class="btn btn-warning w-100 btn-agregar" 
                                    data-nombre="${plan.nombre}" 
                                    data-precio="${plan.precio}">
                                Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        contenedor.innerHTML = htmlPlanes;
        activarEventosTarjetas();

    } catch (error) {
        console.error('Hubo un error cargando los planes:', error);
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(`data/productos.json?v=${new Date().getTime()}`);
        const data = await respuesta.json();
        
        const contenedorMics = document.getElementById('contenedor-microfonos');
        const contenedorInts = document.getElementById('contenedor-interfaces');
        
        let htmlMics = '';
        let htmlInts = '';

        data.microfonos.forEach(prod => {
            htmlMics += generarTemplateProducto(prod);
        });

        data.interfaces.forEach(prod => {
            htmlInts += generarTemplateProducto(prod);
        });

        if (contenedorMics) contenedorMics.innerHTML = htmlMics;
        if (contenedorInts) contenedorInts.innerHTML = htmlInts;

        activarEventosTarjetas();

    } catch (error) {
        console.error('Error cargando los productos:', error);
    }
}
function generarTemplateProducto(prod) {
    return `
        <div class="col-xl-6">
            <div class="card text-white rr h-100 tarjeta-modal" style="cursor: pointer;" 
                 data-nombre="${prod.nombre}"
                 data-precio="${prod.precio}"
                 data-imagen="${prod.imagen}"
                 data-descripcion="${prod.descripcion}">
                <div class="row g-0 h-100">
                    <div class="col-md-5">
                        <img src="${prod.imagen}" class="img-fluid rounded-start h-100" style="object-fit: cover;" alt="${prod.nombre}">
                    </div>
                    <div class="col-md-7">
                        <div class="card-body d-flex flex-column h-100 text-start">
                            <h5 class="card-title text-warning fw-bold">${prod.nombre}</h5>
                            <div class="mt-auto">
                                <p class="card-text mb-2"><strong>Valor $${typeof prod.precio === 'number' ? prod.precio.toLocaleString('en-US') : prod.precio} USD</strong></p>
                                <button type="button" class="btn btn-warning w-100 fw-bold btn-agregar" 
                                        data-nombre="${prod.nombre}" 
                                        data-precio="${prod.precio}">
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function activarEventosTarjetas() {
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation();
            const nombre = boton.getAttribute('data-nombre');
            const precio = parseFloat(boton.getAttribute('data-precio'));
            agregarAlCarrito(nombre, precio);
        });
    });

    const tarjetasModal = document.querySelectorAll('.tarjeta-modal');
    tarjetasModal.forEach(tarjeta => {
        tarjeta.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-agregar')) return;

            const nombre = tarjeta.getAttribute('data-nombre');
            const precio = tarjeta.getAttribute('data-precio');
            const imagen = tarjeta.getAttribute('data-imagen');
            const descripcion = tarjeta.getAttribute('data-descripcion');
            
            prepararModal(nombre, precio, imagen, descripcion);

            const modalEl = document.getElementById('modalDetalleDisco');
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        });
    });
}

function mostrarMensaje(contenedor, mensaje, tipo) {
    if (!contenedor) return;

    const esExito = tipo === 'success';
    const colorBorde = esExito ? '#d4af37' : '#dc3545';
    const colorTexto = esExito ? '#f1c40f' : '#ff6b6b';
    const colorSombra = esExito ? 'rgba(212, 175, 55, 0.25)' : 'rgba(220, 53, 69, 0.25)';

    contenedor.innerHTML = `
        <div class="p-3 my-3 text-center fw-bold rounded" style="
            background-color: rgba(10, 10, 10, 0.95);
            border: 1px solid ${colorBorde};
            color: ${colorTexto};
            box-shadow: 0 0 15px ${colorSombra};
            letter-spacing: 0.5px;
            font-size: 0.88rem;
            text-transform: uppercase;
        ">
            ${mensaje}
        </div>
    `;
}

function mostrarAlertaCarrito(mensaje, tipo) {
    let modalBody = document.querySelector('#modalCarrito .modal-body');
    if (!modalBody) return;

    let alertaAntigua = modalBody.querySelector('.alerta-carrito-custom');
    if (alertaAntigua) alertaAntigua.remove();

    const esExito = tipo === 'success';
    const esWarning = tipo === 'warning';
    
    const colorBorde = esExito ? '#d4af37' : (esWarning ? '#ffc107' : '#dc3545');
    const colorTexto = esExito ? '#f1c40f' : (esWarning ? '#ffda6a' : '#ff6b6b');
    const colorSombra = esExito ? 'rgba(212, 175, 55, 0.25)' : 'rgba(220, 53, 69, 0.25)';

    const divAlerta = document.createElement('div');
    divAlerta.className = 'alerta-carrito-custom p-3 my-2 text-center fw-bold rounded';
    divAlerta.style.cssText = `
        background-color: rgba(10, 10, 10, 0.95);
        border: 1px solid ${colorBorde};
        color: ${colorTexto};
        box-shadow: 0 0 15px ${colorSombra};
        letter-spacing: 0.5px;
        font-size: 0.85rem;
        text-transform: uppercase;
    `;
    divAlerta.innerText = mensaje;

    modalBody.insertBefore(divAlerta, modalBody.firstChild);
}