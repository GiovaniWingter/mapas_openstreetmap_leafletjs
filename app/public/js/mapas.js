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
    const iconLaranja = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    const iconVerde = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let marcadorLocal = null;
    let marcadorDestino = null;
    let capturarLocal = false; // Controla se o próximo clique no mapa deve ser capturado
    const inputLocal = document.getElementById('seulocal');
    const inputDestino = document.getElementById('destino');
    const tracarRota = document.getElementById('rota');
    // Quando o input ganha foco, ativa a captura
    inputLocal.addEventListener('focus', () => {
        capturarLocal = true;
        capturarDestino = false;
    });
    // Quando o input ganha foco, ativa a captura
    inputDestino.addEventListener('focus', () => {
        capturarLocal = false;
        capturarDestino = true;
    });
    let controleRota = null;
    tracarRota.addEventListener("click", () => {
        capturarLocal = false;
        capturarDestino = false;
        if (!inputLocal.value || !inputDestino.value) {
            alert("Por favor, selecione os dois pontos para traçar a rota.");
            return;
        }
        // Extrair coordenadas dos inputs
        const [lat1, lon1] = inputLocal.value.split(",").map(coord => parseFloat(coord.trim()));
        const [lat2, lon2] = inputDestino.value.split(",").map(coord => parseFloat(coord.trim()));
        // Remove rota anterior, se houver
        if (controleRota) {
            map.removeControl(controleRota);
        }
        // Criar nova rota com painel na div#rota
        controleRota = L.Routing.control({
            waypoints: [
                L.latLng(lat1, lon1),
                L.latLng(lat2, lon2)
            ],
            routeWhileDragging: false,
            createMarker: function () { return null; }, // não adiciona marcadores automáticos
            show: false,
            router: L.Routing.osrmv1({ language: 'en', profile: 'car' }),
            language: 'en',
            collapsible: false,
            formatter: new L.Routing.Formatter({ language: 'en' }),
            containerClassName: 'custom-routing-container'
        }).addTo(map);
        // remove a div de direções
        map.on('layeradd', function () {
            var routingContainer = document.querySelector('.leaflet-routing-container');
            if (routingContainer) {
                routingContainer.style.display = 'none'; // Garante que a div não seja visível
            }
        });
        // Redirecionar o conteúdo para a div#rota
        controleRota.on('routesfound', function (e) {
            const summary = e.routes[0].summary;
            const rotaDiv = document.getElementById('instrucoesRota');
            // Limpa conteúdo anterior
            rotaDiv.innerHTML = '';
            // Adiciona distância e duração
            rotaDiv.innerHTML += `<p><strong>Distância:</strong> ${(summary.totalDistance / 1000).toFixed(2)} km</p>`;
            rotaDiv.innerHTML += `<p><strong>Duração estimada:</strong> ${(summary.totalTime / 60).toFixed(0)} minutos</p>`;
        });
    });

    // Listener do clique no mapa
    map.on('click', function (e) {
        const lat = e.latlng.lat.toFixed(5);
        const lng = e.latlng.lng.toFixed(5);
        if (capturarLocal) {
            inputLocal.value = `${lat}, ${lng}`;
            // Remove marcador anterior, se houver
            if (marcadorLocal) {
                map.removeLayer(marcadorLocal);
            }
            // Adiciona novo marcador laranja
            marcadorLocal = L.marker([lat, lng], { icon: iconLaranja }).addTo(map)
                .bindPopup(`Local selecionado:<br>Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
            capturarLocal = false;
            inputLocal.focus();
        }
        if (capturarDestino) {
            inputDestino.value = `${lat}, ${lng}`;
            // Remove marcador anterior, se houver
            if (marcadorDestino) {
                map.removeLayer(marcadorDestino);
            }
            // Adiciona novo marcador azul verde
            marcadorDestino = L.marker([lat, lng], { icon: iconVerde }).addTo(map)
                .bindPopup(`Destino selecionado:<br>Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
            capturarDestino = false;
            inputDestino.focus();
        }
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