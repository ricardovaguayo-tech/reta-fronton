import { useState } from "react";

const Card = ({ children }) => <div style={{border:"1px solid #ccc", padding:"10px", borderRadius:"10px"}}>{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const Button = (props) => <button style={{padding:"8px", margin:"5px"}} {...props} />;
const Input = (props) => <input style={{padding:"8px"}} {...props} />;
``
export default function App() {
  const [players, setPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]); // fila
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });
  const [name, setName] = useState("");

  // Forma parejas automáticamente (en orden de llegada)
  const buildTeams = (list) => {
    if (list.length < 4) return { teamA: [], teamB: [] };


    return {
      teamA: [list[0], list[1]],
      teamB: [list[2], list[3]],
      rest: list.slice(4),
    };
  };


  const organize = (allPlayers) => {
    const all = [...allPlayers];


    if (all.length >= 4) {
      const { teamA, teamB, rest } = buildTeams(all);
      setCourts({ teamA, teamB });
      setWaiting(rest);
    } else {
      setCourts({ teamA: [], teamB: [] });
      setWaiting(all);
    }
  };


  const addPlayer = () => {
    if (!name) return;
    const updated = [...players, name];
    setPlayers(updated);
    organize(updated);
    setName("");
  };

  const removePlayer = (player) => {
    const updated = players.filter((p) => p !== player);
    setPlayers(updated);
    organize(updated);
  };

  // Define ganador (teamA o teamB)
  const winner = (winnerSide) => {
    const { teamA, teamB } = courts;
    if (teamA.length < 2 || teamB.length < 2) return;
    const winnerTeam = winnerSide === "A" ? teamA : teamB;
    const loserTeam = winnerSide === "A" ? teamB : teamA;
    let newWaiting = [...waiting, ...loserTeam];
    // Si hay 2 parejas esperando → rota campeón
    if (newWaiting.length >= 4) {
      const nextTeam = newWaiting.slice(0, 2);
      const nextRival = newWaiting.slice(2, 4);
      const rest = newWaiting.slice(4);
      setCourts({ teamA: nextTeam, teamB: nextRival });
      setWaiting([...rest, ...winnerTeam]);
    } else if (newWaiting.length >= 2) {
      // Solo 1 pareja → ganador se queda
      const challengers = newWaiting.slice(0, 2);
      const rest = newWaiting.slice(2);


      setCourts({ teamA: winnerTeam, teamB: challengers });
      setWaiting(rest);
    } else {
      // No hay suficientes
      setWaiting(newWaiting);
    }
  };

  return (
    <div className="p-4 grid gap-4">
      <h1 className="text-xl font-bold">Reta Frontón</h1>

      <Card>
        <CardContent className="p-4 flex gap-2">
          <Input
            placeholder="Nombre jugador"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={addPlayer}>Entra jugador</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold">En juego</h2>


          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h3 className="font-medium">Pareja A</h3>
              {courts.teamA.map((p, i) => (
                <div key={i} className="p-2 bg-green-200 rounded mt-1">
                  {p}
                </div>
              ))}
              <Button className="mt-2" onClick={() => winner("A")}>
                Gana A
              </Button>
            </div>


            <div>
              <h3 className="font-medium">Pareja B</h3>
              {courts.teamB.map((p, i) => (
                <div key={i} className="p-2 bg-blue-200 rounded mt-1">
                  {p}
                </div>
              ))}
              <Button className="mt-2" onClick={() => winner("B")}>
                Gana B
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold">Fila de espera</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {waiting.map((p, i) => (
              <div key={i} className="p-2 bg-gray-200 rounded">
                {p}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold">Todos los jugadores</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {players.map((p, i) => (
              <div key={i} className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded">
                {p}
                <button onClick={() => removePlayer(p)}>❌</button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
