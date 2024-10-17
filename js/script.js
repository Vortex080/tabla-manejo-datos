window.addEventListener('load', function () {
    // Trae la plantilla HTML de una tabla desde un archivo externo y la inserta en el contenedor
    let container = document.getElementById('container'); // Contenedor donde se insertará la tabla
    let aux = document.createElement('div'); // Div auxiliar para procesar la plantilla
    let auxtbody = document.createElement('tbody'); // TBody auxiliar para extraer el modelo de fila
    let tabla; // Variable para almacenar la tabla que se traerá de la plantilla
    let tBody; // Variable para almacenar el body de la tabla
    let modelo; // Variable para almacenar un modelo de fila (la primera fila de la tabla)

    // Fetch para cargar la plantilla de la tabla desde el archivo 'tabla.html'
    fetch('./plantillas/tabla.html')
        .then(respuesta => respuesta.text())
        .then(texto => {
            // Asigna el contenido HTML traído a la variable aux
            aux.innerHTML = texto;
            // Obtiene la primera tabla dentro de aux
            tabla = aux.firstElementChild;
            // Obtiene el primer tbody de la tabla
            tBody = tabla.tBodies[0];
            // Extrae la primera fila como modelo de la tabla
            auxtbody.appendChild(tBody.firstElementChild);
            modelo = auxtbody.firstElementChild;
            // Inserta la tabla completa en el contenedor
            container.appendChild(tabla);

            // Variable para manejar el orden de la columna (ascendente/descendente)
            let orden = -1;

            // Asigna eventos para ordenar la tabla al hacer clic en las columnas de nombre y dni
            const nombre = document.getElementById('nombre'); // Celda donde está el nombre
            const dni = document.getElementById('dni'); // Celda donde está el dni

            // Evento para ordenar por la columna de nombre
            nombre.addEventListener('click', () => tabla.ordenar(1, orden = orden * -1));
            // Evento para ordenar por la columna de dni
            dni.addEventListener('click', () => tabla.ordenar(0, orden = orden * -1));

            // Evento para editar una fila al hacer doble clic en la tabla
            tabla.addEventListener('dblclick', () => tabla.edita());

            // Botón para guardar los datos en localStorage
            let saveDB = this.document.createElement('button');
            saveDB.innerHTML = 'Grabar datos';
            container.appendChild(saveDB);
            saveDB.addEventListener('click', () => tabla.savelocalStorage());

            // Botón para cargar los datos desde un archivo externo
            let getDB = document.createElement('button');
            getDB.innerHTML = 'Traer Datos Fichero';
            container.appendChild(getDB);
            getDB.addEventListener('click', () => tabla.getDataDB(modelo));

            // Botón para cargar los datos desde localStorage
            let getLocal = this.document.createElement('button');
            getLocal.innerHTML = 'Traer Datos LocalStorage';
            container.appendChild(getLocal);
            getLocal.addEventListener('click', () => tabla.getLocalStorage());

            // Botón para limpiar la tabla
            let clearbtn = document.createElement('button');
            clearbtn.innerHTML = 'Limpiar Tabla';
            container.appendChild(clearbtn);
            clearbtn.addEventListener('click', function () {
                location.reload(); // Recarga la página para limpiar la tabla
                let tbody = tabla.tBodies[0];
                tbody.innerHTML = ''; // Limpia el contenido del tbody
            });

            // Fetch para cargar los datos iniciales desde un archivo JSON
            fetch('BD/datos.json')
                .then(respuesta => respuesta.json())
                .then(datos => {
                    // Agrega cada dato (dni y nombre) como una fila en la tabla
                    datos.forEach(element => {
                        let fila = modelo.cloneNode(true); // Clona el modelo de fila
                        fila.children[0].innerHTML = element.dni; // Inserta el dni en la primera celda
                        fila.children[1].innerHTML = element.nombre; // Inserta el nombre en la segunda celda
                        tBody.appendChild(fila); // Agrega la fila al body de la tabla
                    });
                })
        });
});

// Función para ordenar las filas de la tabla según una columna
HTMLTableElement.prototype.ordenar = function (columna, orden = 1, metodo) {
    // Obtiene el cuerpo de la tabla (tbody)
    let cuerpo = document.getElementsByTagName('tbody')[0];

    // Obtiene todas las filas del tbody
    let filas = cuerpo.getElementsByTagName('tr');

    // Convierte las filas a un array
    let v = Array.from(filas);

    // Si se ha introducido un método de comparación, lo utiliza para ordenar
    if (metodo) {
        v.sort(function (f1, f2) {
            return orden * metodo(f1.cells[columna].innerHTML, f2.cells[columna].innerHTML);
        });
    } else {
        // Si no hay método, ordena alfabéticamente
        v.sort(function (f1, f2) {
            return orden * f1.cells[columna].innerHTML.localeCompare(f2.cells[columna].innerHTML);
        });
    }

    // Inserta las filas ya ordenadas en el tbody
    v.forEach(function (v) { cuerpo.appendChild(v) });
}

// Función para guardar los datos de la tabla en localStorage
HTMLTableElement.prototype.savelocalStorage = function () {
    let datos = [];
    // Recorre cada fila de la tabla (omitida la primera fila que es la cabecera)
    for (let i = 1; i < this.rows.length; i++) {
        let savefila = this.rows[i];
        // Crea un objeto con el dni y el nombre de cada fila
        let dbfila = {
            dni: savefila.cells[0].textContent,
            nombre: savefila.cells[1].textContent
        }
        // Lo añade al array de datos
        datos.push(dbfila);
    }
    // Limpia localStorage y guarda los datos actuales
    localStorage.removeItem('data');
    localStorage.clear();
    console.log(datos);
    localStorage.setItem("data", JSON.stringify(datos));
}

// Función para habilitar la edición de una fila al hacer doble clic en ella
HTMLTableElement.prototype.edita = function () {
    let newrow = document.createElement('tr');
    let dnicell = document.createElement('td');
    let namecell = document.createElement('td');
    newrow.appendChild(dnicell);
    newrow.appendChild(namecell);

    let dniinp = document.createElement('input');
    dniinp.disabled = true; // Deshabilitar el input inicialmente
    let nameinp = document.createElement('input');
    nameinp.disabled = true; // Deshabilitar el input inicialmente
    dnicell.appendChild(dniinp);
    namecell.appendChild(nameinp);

    let tBody = this.tBodies[0];
    tBody.appendChild(newrow);

    let thead = this.querySelector('thead tr');
    let rows = this.querySelectorAll('tbody tr');

    // Añade la columna de "Acciones" solo si no existe
    if (!document.getElementById('acciones-header')) {
        let thAcciones = document.createElement('th');
        thAcciones.id = 'acciones-header';
        thAcciones.textContent = 'Acciones';
        thead.appendChild(thAcciones);

        // Para cada fila de la tabla, añade botones de edición y borrado
        rows.forEach(function (row) {
            let tdAcciones = document.createElement('td');

            // Botón para editar
            let buttonE = document.createElement('button');
            buttonE.textContent = 'e';
            buttonE.addEventListener('click', function () {
                convertirAFilaEditable(row);
                toggleButtons(tdAcciones, ['g', 'c']); // Cambia los botones a guardar/cancelar
            });

            // Botón para borrar
            let buttonB = document.createElement('button');
            buttonB.textContent = 'b';
            buttonB.addEventListener('click', function () {
                rowDelete(row); // Pasa la fila como argumento para eliminarla
            });

            tdAcciones.appendChild(buttonE);
            tdAcciones.appendChild(buttonB);
            row.appendChild(tdAcciones);
        });
    }
}

// Función para habilitar los inputs y cambiar los botones a guardar/cancelar
function convertirAFilaEditable(row) {
    let inputs = row.querySelectorAll('input');
    inputs.forEach(input => input.disabled = false); // Habilita los inputs
}

// Función para alternar entre botones de edición/borrado y guardar/cancelar
function toggleButtons(tdAcciones, buttons) {
    // Elimina los botones actuales
    tdAcciones.innerHTML = '';

    // Crear botones según los valores pasados
    buttons.forEach(function (buttonType) {
        let button = document.createElement('button');
        button.textContent = buttonType;
        button.addEventListener('click', function () {
            if (buttonType === 'g') { // Si es guardar
                convertirAFilaNoEditable(tdAcciones.parentNode); // Guardar la fila
                toggleButtons(tdAcciones, ['e', 'b']); // Vuelve a los botones editar/borrar
            } else if (buttonType === 'c') { // Si es cancelar
                cancelarEdicion(tdAcciones.parentNode); // Cancela la edición
                toggleButtons(tdAcciones, ['e', 'b']); // Vuelve a los botones editar/borrar
            }
        });
        tdAcciones.appendChild(button);
    });
}

// Función para convertir una fila a no editable, deshabilitando los inputs y actualizando los valores
function convertirAFilaNoEditable(row) {
    let inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = true; // Deshabilitar los inputs tras guardar
        let value = input.value;
        let cell = input.parentElement;
        cell.textContent = value; // Actualiza la celda con el valor del input
    });
}

// Función para cancelar la edición (revertir cambios)
function cancelarEdicion(row) {
    let inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = true; // Vuelve a deshabilitar los inputs
    });
}

// Función para eliminar la fila
function rowDelete(row) {
    row.remove(); // Elimina la fila de la tabla
}

// Función para añadir una nueva línea en la tabla usando el modelo de fila
HTMLTableElement.prototype.addline = function (modelo) {
    let tBody = this.tBodies[0]; // Obtiene el tbody de la tabla
    let fila = modelo.cloneNode(true); // Clona el modelo de fila
    let dniinp = document.createElement('input'); // Crea un input para dni
    dniinp.disabled = true; // Deshabilita el input
    let nameinp = document.createElement('input'); // Crea un input para nombre
    nameinp.disabled = true; // Deshabilita el input
    fila.children[0].appendChild(dniinp); // Añade el input al td de dni
    fila.children[1].appendChild(nameinp); // Añade el input al td de nombre
    tBody.appendChild(fila); // Agrega la nueva fila al tbody
}

// Función para obtener datos del localStorage y mostrarlos en la tabla
HTMLTableElement.prototype.getLocalStorage = function () {
    let data = localStorage.getItem('data'); // Obtiene los datos del localStorage

    if (data) {
        let datos = JSON.parse(data); // Parsea los datos a un objeto
        let tbody = this.tBodies[0]; // Obtiene el tbody de la tabla

        // Limpia el tbody para eliminar cualquier fila existente (excepto los headers)
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        // Por cada elemento en los datos del localStorage, crea una nueva fila
        datos.forEach(element => {
            let newrow = document.createElement('tr'); // Crea una nueva fila

            let dnicell = document.createElement('td'); // Crea una celda para dni
            dnicell.textContent = element.dni; // Establece el dni en la celda
            newrow.appendChild(dnicell); // Añade la celda a la fila

            let nombrecell = document.createElement('td'); // Crea una celda para nombre
            nombrecell.textContent = element.nombre; // Establece el nombre en la celda
            newrow.appendChild(nombrecell); // Añade la celda a la fila

            tbody.appendChild(newrow); // Agrega la nueva fila al tbody
        });
    }
}


// Función para obtener datos desde un archivo JSON y mostrarlos en la tabla
HTMLTableElement.prototype.getDataDB = function (modelo) {
    // Trae el tbody de la tabla
    let tBody = this.tBodies[0];

    // Limpia el tbody para eliminar cualquier fila existente (excepto los headers)
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }

    // Fetch para obtener la plantilla
    fetch('./plantillas/tabla.html')
        .then(respuesta => respuesta.text())
        .then(texto => {
            // Fetch para obtener los datos desde el archivo JSON
            fetch('BD/datos.json')
                .then(respuesta => respuesta.json())
                .then(datos => {
                    // Agrega cada dato (dni y nombre) como una fila en la tabla
                    datos.forEach(element => {
                        let fila = modelo.cloneNode(true); // Clona el modelo de fila
                        fila.children[0].innerHTML = element.dni; // Inserta el dni en la primera celda
                        fila.children[1].innerHTML = element.nombre; // Inserta el nombre en la segunda celda
                        tBody.appendChild(fila); // Agrega la fila al body de la tabla
                    });
                });
        });
}

