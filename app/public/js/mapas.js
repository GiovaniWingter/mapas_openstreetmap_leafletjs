let map;
let markersGroup;

document.addEventListener("DOMContentLoaded", async () => {
    // Criar o mapa apenas uma vez
    map = L.map('map').setView([-23.515860131395115, -46.872190853182495], 14);

    // Adicionar camada do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Buscar todos os pontos inicialmente
    const resposta = await fetch(`http://localhost:3000/api/pontos`);
    const locations = await resposta.json();
    listarPontos(locations);


    // Listener para pegar clique no mapa e mostrar coordenada
    map.on('click', function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        console.log(`Clique em Lat: ${lat}, Lng: ${lng}`);

        L.popup()
            .setLatLng(e.latlng)
            .setContent(`Coordenadas: <br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
            .openOn(map);
    });

    // Pede permissão e tenta obter localização atual
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                map.setView([lat, lon], 14);
                L.marker([lat, lon]).addTo(map).bindPopup("Você está aqui").openPopup();
            },
            (err) => {
                console.warn("Erro ao obter localização:", err);
            }
        );
    }

    // Quando mudar o tipo, buscar os pontos filtrados
    document.getElementById("tipo").addEventListener("change", async (event) => {
        const tipoSelecionado = event.target.value;
        const resposta = await fetch(`http://localhost:3000/api/pontos?tipo=${tipoSelecionado}`);
        const locations = await resposta.json();
        listarPontos(locations);
    });
});


async function listarPontos(locations) {
    // Remove marcadores anteriores, se houver
    if (markersGroup) {
        markersGroup.clearLayers();
    }

    // Cria um novo grupo de marcadores
    markersGroup = L.layerGroup().addTo(map);

    locations.forEach(function (location) {
        L.marker([location.lat, location.lon])
            .bindPopup(`<b>${location.nome}</b><br>${location.descr}`)
            .addTo(markersGroup);
    });

}