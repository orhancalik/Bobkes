import { CapturedPokemon } from "./types";

let isUserTurn = true;

export async function performAttack(
  attackerIndex: number,
  defenderIndex: number,
  pokemonDetails: CapturedPokemon[]
): Promise<boolean> {
  const attacker = pokemonDetails[attackerIndex];
  const defender = pokemonDetails[defenderIndex];

  const attackPower = attacker.attack;
  const defensePower = defender.defence;
  const damage = attackPower - defensePower;

  if (damage > 0) {
    defender.hp -= damage;
    if (defender.hp < 0) defender.hp = 0;
  }

  document.getElementById(`pokemon${defenderIndex + 1}HP`)!.innerText =
    defender.hp.toString();
  document.getElementById(
    `pokemon${defenderIndex + 1}HPBar`
  )!.style.width = `${defender.hp}%`;

  if (defender.hp <= 0) {
    document.getElementById(
      "battleResult"
    )!.innerText = `${attacker.name} wins!`;
    return true;
  }

  return false;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
let pokemonDetails: CapturedPokemon[] = [
  {
    level: 20,
    number: 1,
    speed: 50,
    name: "Pokemon1",
    moves: ["move1", "move2", "move3", "move4"],
    image: "url-to-sprite1",
    hp: 100,
    defence: 5,
    attack: 10,
  },
  {
    level: 20,
    number: 1,
    speed: 50,
    name: "Pokemon2",
    moves: ["move1", "move2", "move3", "move4"],
    image: "url-to-sprite2",
    hp: 100,
    defence: 5,
    attack: 8,
  },
];

document.querySelectorAll(".move").forEach((item) => {
  item.addEventListener("click", async (event) => {
    if (!isUserTurn) return;

    const attackerIndex = parseInt((item as HTMLElement).dataset.pokemon!) - 1;
    const moveIndex = parseInt((item as HTMLElement).dataset.move!);
    const defenderIndex = attackerIndex === 0 ? 1 : 0;

    const battleOver = await performAttack(
      attackerIndex,
      defenderIndex,
      pokemonDetails
    );

    if (!battleOver) {
      isUserTurn = false;
      await delay(1000);
      const opponentMoveIndex = Math.floor(Math.random() * 4);
      const opponentBattleOver = await performAttack(
        defenderIndex,
        attackerIndex,
        pokemonDetails
      );

      if (!opponentBattleOver) {
        isUserTurn = true;
      }
    }
  });
});
