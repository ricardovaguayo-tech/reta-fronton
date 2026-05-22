

import { useState } from "react";

// Componentes simplificados (sin librerías externas)
const Card = ({ children }) => (
  <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}>
    {children}
  </div>
);


const CardContent = ({ children }) => <div>{children}</div>;


const Button = (props) => (
  <button style={{ padding: "8px", margin: "5px", cursor: "pointer" }} {...props} />
);


const Input = (props) => (
  <input style={{ padding: "8px", marginRight: "5px" }} {...props} />
);


export default function App() {
  const [players, setPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]); // fila
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });
  const [name, setName] = useState("");

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

  const winner = (winnerSide) => {
    const { teamA, teamB } = courts;
    if (teamA.length < 2 || teamB.length < 2) return;
    const winnerTeam = winnerSide === "A" ? teamA : teamB;
    const loserTeam = winnerSide === "A" ? teamB : teamA;
    let newWaiting = [...waiting, ...loserTeam];


    if (newWaiting.length >= 4) {
      const nextTeam = newWaiting.slice(0, 2);
      const nextRival = newWaiting.slice(2, 4);
      const rest = newWaiting.slice(4);
      setCourts({ teamA: nextTeam, teamB: nextRival });
      setWaiting([...rest, ...winnerTeam]);
    } else if (newWaiting.length >= 2) {
      const challengers = newWaiting.slice(0, 2);
      const rest = newWaiting.slice(2);

      setCourts({ teamA: winnerTeam, teamB: challengers });
      setWaiting(rest);
    } else {
      setWaiting(newWaiting);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reta Frontón</h1>
      <Card>
        <CardContent>
          <Input
            placeholder="Nombre jugador"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={addPlayer}>Entra jugador</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2>En juego</h2>
          <div style={{ display: "flex", gap: "20px" }}>
            <div>
              <h3>Pareja A</h3>
              {courts.teamA.map((p, i) => (
                <div key={i}>{p}</div>
              ))}
              <Button onClick={() => winner("A")}>Gana A</Button>
            </div>

            <div>
              <h3>Pareja B</h3>
              {courts.teamB.map((p, i) => (
                <div key={i}>{p}</div>
              ))}
              <Button onClick={() => winner("B")}>Gana B</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2>Fila de espera</h2>
          {waiting.map((p, i) => (
            <div key={i}>{p}</div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2>Todos los jugadores</h2>
          {players.map((p, i) => (
            <div key={i}>
              {p} <button onClick={() => removePlayer(p)}>❌</button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
