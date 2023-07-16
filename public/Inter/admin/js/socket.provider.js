$(document).ready(function() {
    const socket = io('http://127.0.0.1:5002');
    socket.on('connect', function() {
        console.log('Connected');
    });
    socket.on('receiveInfo', function(data) {
            const message = `${data.hash} at ${data.date}`;
            iziToast.show({
                position: "bottomRight",
                color: "#c99094",
                layout: 2,
                title: `Withdraw of $${Math.floor(data.amount_usd)} (${Number(data.amount).toFixed(5)} ETH) 🥳🥳`,
                image: 'https://img.freepik.com/psd-gratuit/plate-forme-podium-ethereum-rouge-pour-presentation-du-produit-rendu-3d-stand-piedestal-luxe-spectacle-fond-scene-studio-scene-table-vide-projecteur_1258-105446.jpg',
                timeout: 7000,
                message,
            });
    });

    socket.on('disconnect', function() {
        console.log('Disconnected');
    });

});