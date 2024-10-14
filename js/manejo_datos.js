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
});