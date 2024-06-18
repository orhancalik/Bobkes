document.addEventListener('DOMContentLoaded', function () {
    const saveNicknameBtn = document.getElementById('saveNicknameBtn');
    const nicknameInput = document.getElementById('nickname');

    if (saveNicknameBtn && nicknameInput) {
        saveNicknameBtn.addEventListener('click', function () {
            const newNickname = nicknameInput.value;
            const pokemonName = document.getElementById('pokemonName').innerText;

            fetch(`/pokemon/${pokemonName}/updateNickname`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname: newNickname })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update nickname');
                }
                return response.json();
            })
            .then(data => {
                // Update the displayed nickname
                document.getElementById('pokemonName').innerText = newNickname;
                alert('Bijnaam succesvol bijgewerkt!');
            })
            .catch(error => {
                console.error('Error updating nickname:', error);
                alert('Er is een fout opgetreden bij het bijwerken van de bijnaam.');
            });
        });
    } else {
        console.error('Could not find saveNicknameBtn or nicknameInput');
    }
});
