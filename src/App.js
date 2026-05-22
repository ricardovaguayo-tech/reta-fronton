import { useState, useEffect } from "react";

const Box = ({ children, color }) => (
  <div style={{
    border: "2px solid black",
    padding: "10px",
    borderRadius: "10px",
    background: color || "white",
    minHeight: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }}>
    {children}
  </div>
);

const Button = (props) => (
  <button style={{ padding: "8px", margin: "5px", cursor: "pointer" }} {...props} />
);

export default function App() {
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [courts, setCourts] = useState({ teamA: [], teamB: [] });
  const [name, setName] = useState("");
  const [streak, setStreak] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("players");
    if (data) setSavedPlayers(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(savedPlayers));
  }, [savedPlayers]);

  const buildTeams = (list) => {
    if (list.length < 4) return { teamA: [], teamB: [] };
    return {
      teamA: [list[0], list[1]],
      teamB: [list[2], list[3]],
      rest: list.slice(4),
    };
  };

  const organize = (allPlayers) => {
    if (allPlayers.length >= 4) {
      const { teamA, teamB, rest } = buildTeams(allPlayers);
      setCourts({ teamA, teamB });
      setWaiting(rest);
    } else {
      setCourts({ teamA: [], teamB: [] });
      setWaiting(allPlayers);
    }
  };

  const addPlayer = (p) => {
    if (!p) return;
    const updated = [...players, p];
    setPlayers(updated);
    organize(updated);

    if (!savedPlayers.includes(p)) {
      setSavedPlayers([...savedPlayers, p]);
    }

    setName("");
  };

  const removePlayer = (p) => {
    const updated = players.filter(x => x !== p);
    setPlayers(updated);
    organize(updated);
  };

  const resetScore = () => {
    setScoreA(0);
    setScoreB(0);
  };

  const winner = (side) => {
    const { teamA, teamB } = courts;
    if (teamA.length < 2 || teamB.length < 2) return;

    const winnerTeam = side === "A" ? teamA : teamB;
    const loserTeam = side === "A" ? teamB : teamA;
    let newWaiting = [...waiting, ...loserTeam];
    const newStreak = streak + 1;

    resetScore();

    if (newWaiting.length >= 4) {
      if (newStreak < 2) {
        const challengers = newWaiting.slice(0, 2);
        const rest = newWaiting.slice(2);
        setCourts({ teamA: winnerTeam, teamB: challengers });
        setWaiting(rest);
        setStreak(newStreak);
      } else {
        const nextTeam = newWaiting.slice(0, 2);
        const nextRival = newWaiting.slice(2, 4);
        const rest = newWaiting.slice(4);
        setCourts({ teamA: nextTeam, teamB: nextRival });
        setWaiting([...rest, ...winnerTeam]);
        setStreak(0);
      }
    } else if (newWaiting.length === 3) {
      organize([...winnerTeam, ...newWaiting]);
      setStreak(0);
    } else if (newWaiting.length >= 2) {
      const challengers = newWaiting.slice(0, 2);
      const rest = newWaiting.slice(2);
      setCourts({ teamA: winnerTeam, teamB: challengers });
      setWaiting(rest);
      setStreak(newStreak);
    } else {
      setWaiting(newWaiting);
      setStreak(newStreak);
    }
  };

  return (
    <div style={{ padding: 15 }}>
      <h2>🎾 Reta Frontón</h2>
      {/* Entrada rápida */}
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jugador" />
        <Button onClick={() => addPlayer(name)}>Agregar</Button>
      </div>
      <div>
        {savedPlayers.map((p, i) => (
          <Button key={i} onClick={() => addPlayer(p)}>{p}</Button>
        ))}
      </div>

      {/* CANCHA */}
      <div style={{ marginTop: 20 }}>
        <h3>En juego</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

          <Box color="#3b82f6">
            <strong>Equipo A</strong>
            {courts.teamA.map((p, i) => <div key={i}>{p}</div>)}
            <div>A: {scoreA}</div>
            <Button onClick={() => setScoreA(scoreA + 1)}>+ Punto</Button>
            <Button onClick={() => winner("A")}>Gana</Button>
          </Box>


          <Box color="#ef4444">
            <strong>Equipo B</strong>
            {courts.teamB.map((p, i) => <div key={i}>{p}</div>)}
            <div>B: {scoreB}</div>
            <Button onClick={() => setScoreB(scoreB + 1)}>+ Punto</Button>
            <Button onClick={() => winner("B")}>Gana</Button>
          </Box>


        </div>
      </div>

      {/* Fila */}
      <div style={{ marginTop: 20 }}>
        <h3>Fila</h3>
        {waiting.map((p, i) => <div key={i}>{p}</div>)}
      </div>
      {/* Lista */}
      <div style={{ marginTop: 20 }}>
        <h3>Jugadores</h3>
        {players.map((p, i) => (
          <div key={i}>{p} <button onClick={() => removePlayer(p)}>❌</button></div>
        ))}
      </div>
    </div>
  );
}
