window.addEventListener('load', function () {
    // Trae la plantilla
    let container = document.getElementById('container');
    let aux = document.createElement('div');
    let auxtbody = document.createElement('tbody');
    let tabla;
    fetch('./plantillas/tabla.html')
        .then(respuesta => respuesta.text())
        .then(texto => {
            aux.innerHTML = texto;
            tabla = aux.firstElementChild;
            let tBody = tabla.tBodies[0];
            auxtbody.appendChild(tBody.firstElementChild);
            let modelo = auxtbody.firstElementChild;
            container.appendChild(tabla);
            // Celda donde esta situada nombre
            const nombre = document.getElementById('nombre');
            // Celda donde esta situada dni
            const dni = document.getElementById('dni');
            // Llama al function ordenar con la tabla con la seguna columna
            nombre.addEventListener('click', () => tabla.ordenar(1, orden = orden * -1));
            // Llama al function ordenar con la tabla con la primera columna
            dni.addEventListener('click', () => tabla.ordenar(0, orden = orden * -1));
            tabla.addEventListener('dblclick', function () {
                let table = document.getElementById('tabla');
                let thead = table.querySelector('thead tr');
                let rows = table.querySelectorAll('tbody tr');
        
                // Añadir columna de acciones solo si no existe
                if (!document.getElementById('acciones-header')) {
                    let thAcciones = document.createElement('th');
                    thAcciones.id = 'acciones-header';
                    thAcciones.textContent = 'Acciones';
                    thead.appendChild(thAcciones);
        
                    rows.forEach(function (row) {
                        let tdAcciones = document.createElement('td');
        
                        // Crear los botones iniciales e y b
                        let buttonE = document.createElement('button');
                        buttonE.textContent = 'e';
                        buttonE.addEventListener('click', function () {
                            convertirAFilaEditable(row);
                            toggleButtons(tdAcciones, ['g', 'c']);
                        });
        
                        let buttonB = document.createElement('button');
                        buttonB.textContent = 'b';
                        buttonB.addEventListener('click', rowDelete());
        
                        tdAcciones.appendChild(buttonE);
                        tdAcciones.appendChild(buttonB);
                        row.appendChild(tdAcciones);
                    });
                }
            });
            fetch('BD/datos.json')
                .then(respuesta => respuesta.json())
                .then(datos => {
                    datos.forEach(element => {
                        let fila = modelo.cloneNode(true);
                        fila.children[0].innerHTML = element.dni;
                        fila.children[1].innerHTML = element.nombre;
                        tBody.appendChild(fila);
                    });
                })
        })


    // Tabla del index
    tabla = document.getElementById('tabla');
    let orden = -1;

    console.log(tabla);



    

    function rowDelete() {
        //this.parentElement.parentElement.remove();
    }

    function convertirAFilaEditable(row) {
        let celdas = row.querySelectorAll('td');
        for (let i = 0; i < celdas.length - 1; i++) { // Evita la columna de acciones
            let textoActual = celdas[i].textContent;
            celdas[i].innerHTML = `<input type="text" value="${textoActual}" />`;
        }
    }

    function toggleButtons(cell, buttons) {
        // Limpiar la celda
        cell.innerHTML = '';

        buttons.forEach(function (letter) {
            let button = document.createElement('button');
            button.textContent = letter;

            if (letter === 'g') {
                button.addEventListener('click', function () {
                    convertirAFilaNoEditable(cell.parentElement); // Convierte los inputs a texto
                });
            } else if (letter === 'c') {
                button.addEventListener('click', function () {
                    toggleButtons(cell, ['e', 'b']);
                });
            }

            cell.appendChild(button);
        });
    }

    function convertirAFilaNoEditable(row) {
        let celdas = row.querySelectorAll('td');
        for (let i = 0; i < celdas.length - 1; i++) { // Evita la columna de acciones
            let input = celdas[i].querySelector('input');
            if (input) {
                let valorActual = input.value;
                celdas[i].textContent = valorActual;
            }
        }
    }
});


HTMLTableElement.prototype.ordenar = function (columna, orden = 1, metodo) {
    // TBODY de la tabla
    let cuerpo = document.getElementsByTagName('tbody')[0];

    // todas las tr de la tabla
    let filas = cuerpo.getElementsByTagName('tr');

    // Array con todas las filas
    let v = Array.from(filas);

    // Verifica si el metodo a sido introducido
    if (metodo) {
        // Ordena segun el metodo introducido
        v.sort(function (f1, f2) {
            return orden * metodo(f1.cells[columna].innerHTML, f2.cells[columna].innerHTML);
        });
    } else {
        // Ordena por orden alfabetico
        v.sort(function (f1, f2) {
            return orden * f1.cells[columna].innerHTML.localeCompare(f2.cells[columna].innerHTML);
        });
    }

    // Inserta ordenado a la tabla
    v.forEach(function (v) { cuerpo.appendChild(v) });

}