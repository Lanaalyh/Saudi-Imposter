import { randomInt, randomUUID } from "node:crypto";

export const categories = [
  { id: "food", name: "أكلات سعودية", icon: "food", description: "أطباق ونكهات من كل منطقة", words: ["كبسة", "جريش", "قرصان", "سليق", "مطازيز", "مرقوق", "معصوب", "كليجا", "حنيني", "عريكة", "مفطح", "مطبق"] },
  { id: "words", name: "كلمات سعودية", icon: "words", description: "مفردات نسمعها كل يوم", words: ["وشلون", "أبشر", "سنع", "علومك", "الزود", "واجد", "دريشة", "كفو", "يا بعدي", "فزعة", "الربع", "هقوة"] },
  { id: "places", name: "أماكن سعودية", icon: "places", description: "من مدن المملكة ومعالمها", words: ["الدرعية", "العلا", "جدة التاريخية", "جبل السودة", "كورنيش الخبر", "أبها", "وادي الديسة", "حافة العالم", "قلعة المصمك", "مدائن صالح", "جزيرة فرسان", "منتزه عسير"] },
  { id: "traditions", name: "عادات وتقاليد", icon: "traditions", description: "طقوس ومناسبات تجمعنا", words: ["القهوة العربية", "المجلس", "العرضة", "الحناء", "الضيافة", "عيدية", "السامري", "المحماس", "المبخرة", "الزفة", "المهرجان", "الدلة"] },
  { id: "clothes", name: "اللبس التقليدي", icon: "clothes", description: "أزياء تراثية من مناطقنا", words: ["الثوب", "الشماغ", "العقال", "البشت", "الغترة", "السديري", "المرودن", "المدورة", "البرقع", "المشلح", "المحزم", "الزبون"] },
] as const;

type Phase = "lobby" | "clues" | "voting" | "result";
type Player = { id: string; token: string; name: string; isHost: boolean; clue?: string; vote?: string };
type Message = { id: string; playerId: string; name: string; text: string; createdAt: string };
export type Room = {
  code: string; category: string; phase: Phase; round: number; players: Player[];
  word: string | null; imposterId: string | null; messages: Message[];
  result: { imposterId: string; word: string; accusedId: string | null; found: boolean } | null;
  updatedAt: number; usedWords: string[];
};

const rooms = new Map<string, Room>();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const touch = (room: Room) => { room.updatedAt = Date.now(); };
setInterval(() => {
  for (const [code, room] of rooms) if (Date.now() - room.updatedAt > 8 * 60 * 60 * 1000) rooms.delete(code);
}, 60 * 60 * 1000).unref();

export function createRoom(name: string, category: string) {
  let code: string;
  do { code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join(""); } while (rooms.has(code));
  const player: Player = { id: randomUUID(), token: randomUUID(), name, isHost: true };
  const room: Room = { code, category, phase: "lobby", round: 0, players: [player], word: null, imposterId: null, messages: [], result: null, usedWords: [], updatedAt: Date.now() };
  rooms.set(code, room);
  return { room, player };
}

export function findRoom(code: string) { return rooms.get(code.toUpperCase()); }
export function findPlayer(room: Room, token: string) { return room.players.find(p => p.token === token); }
export function joinRoom(room: Room, name: string) {
  if (room.phase !== "lobby") throw new GameError(409, "بدأت الجولة بالفعل، انتظر الجولة القادمة");
  if (room.players.length >= 16) throw new GameError(409, "الغرفة ممتلئة");
  if (room.players.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new GameError(409, "الاسم مستخدم في هذه الغرفة");
  const player: Player = { id: randomUUID(), token: randomUUID(), name, isHost: false };
  room.players.push(player);
  touch(room);
  return player;
}

export function startRound(room: Room, player: Player) {
  if (!player.isHost) throw new GameError(403, "المضيف فقط يبدأ الجولة");
  if (room.phase !== "lobby" && room.phase !== "result") throw new GameError(409, "الجولة جارية");
  if (room.players.length < 3) throw new GameError(409, "تحتاجون ثلاثة لاعبين على الأقل");
  const category = categories.find(c => c.id === room.category)!;
  let available: string[] = category.words.filter(w => !room.usedWords.includes(w));
  if (!available.length) { room.usedWords = []; available = [...category.words]; }
  room.word = available[randomInt(available.length)];
  room.usedWords.push(room.word);
  room.imposterId = room.players[randomInt(room.players.length)].id;
  room.phase = "clues";
  room.result = null;
  room.round++;
  for (const p of room.players) { delete p.clue; delete p.vote; }
  touch(room);
}

export function submitClue(room: Room, player: Player, text: string) {
  if (room.phase !== "clues") throw new GameError(409, "ليس وقت التلميحات");
  if (player.clue !== undefined) throw new GameError(409, "أرسلت تلميحك مسبقاً");
  player.clue = text;
  if (room.players.every(p => p.clue !== undefined)) room.phase = "voting";
  touch(room);
}

export function submitVote(room: Room, player: Player, playerId: string) {
  if (room.phase !== "voting") throw new GameError(409, "ليس وقت التصويت");
  if (player.vote !== undefined) throw new GameError(409, "صوتّ مسبقاً");
  if (player.id === playerId) throw new GameError(400, "لا يمكنك التصويت لنفسك");
  if (!room.players.some(p => p.id === playerId)) throw new GameError(400, "اللاعب غير موجود");
  player.vote = playerId;
  if (room.players.every(p => p.vote !== undefined)) {
    const tally = new Map<string, number>();
    for (const p of room.players) tally.set(p.vote!, (tally.get(p.vote!) ?? 0) + 1);
    const max = Math.max(...tally.values());
    const leaders = [...tally.entries()].filter(([, count]) => count === max);
    const accusedId = leaders.length === 1 ? leaders[0][0] : null;
    room.result = { imposterId: room.imposterId!, word: room.word!, accusedId, found: accusedId === room.imposterId };
    room.phase = "result";
  }
  touch(room);
}

export function addMessage(room: Room, player: Player, text: string) {
  room.messages.push({ id: randomUUID(), playerId: player.id, name: player.name, text, createdAt: new Date().toISOString() });
  if (room.messages.length > 100) room.messages.shift();
  touch(room);
}

export function roomState(room: Room, player: Player) {
  return {
    code: room.code, category: room.category, phase: room.phase, round: room.round,
    selfId: player.id, isHost: player.isHost,
    role: room.phase === "lobby" ? null : player.id === room.imposterId ? "imposter" : "player",
    word: room.phase === "result" || (room.phase !== "lobby" && player.id !== room.imposterId) ? room.word : null,
    players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost, hasClue: p.clue !== undefined, hasVoted: p.vote !== undefined })),
    clues: room.players.filter(p => p.clue !== undefined).map(p => ({ playerId: p.id, name: p.name, text: p.clue! })),
    messages: room.messages, voteCount: room.players.filter(p => p.vote !== undefined).length,
    result: room.phase === "result" ? room.result : null,
  };
}

export class GameError extends Error {
  constructor(public status: number, message: string) { super(message); }
}