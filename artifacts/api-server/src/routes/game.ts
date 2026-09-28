import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCategoriesResponse, CreateRoomBody, CreateRoomResponse, JoinRoomParams, JoinRoomBody, JoinRoomResponse,
  GetRoomParams, GetRoomQueryParams, GetRoomResponse, StartRoundParams, StartRoundBody, StartRoundResponse,
  SubmitClueParams, SubmitClueBody, SubmitClueResponse, SubmitVoteParams, SubmitVoteBody, SubmitVoteResponse,
  SendMessageParams, SendMessageBody, SendMessageResponse,
} from "@workspace/api-zod";
import {
  categories, createRoom, findRoom, findPlayer, joinRoom, startRound, submitClue, submitVote,
  addMessage, roomState, GameError, type Room,
} from "../lib/game";

const router: IRouter = Router();
type Schema = { safeParse: (value: unknown) => { success: boolean; data?: any } };

function parse(schema: Schema, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) throw new GameError(400, "البيانات غير صحيحة");
  return result.data!;
}
function lookup(code: string) {
  const room = findRoom(code);
  if (!room) throw new GameError(404, "الغرفة غير موجودة أو انتهت صلاحيتها");
  return room;
}
function authorized(room: Room, token: string) {
  const player = findPlayer(room, token);
  if (!player) throw new GameError(403, "رابط الجلسة غير صالح، انضم للغرفة من جديد");
  return player;
}
function handle(fn: (req: Request, res: Response) => void) {
  return (req: Request, res: Response) => {
    try { fn(req, res); }
    catch (error) {
      if (error instanceof GameError) { res.status(error.status).json({ error: error.message }); return; }
      throw error;
    }
  };
}

router.get("/categories", handle((_req, res) => {
  res.json(GetCategoriesResponse.parse(categories.map(({ id, name, icon, description }) => ({ id, name, icon, description }))));
}));
router.post("/rooms", handle((req, res) => {
  const { name, category } = parse(CreateRoomBody, req.body);
  if (!categories.some(c => c.id === category)) throw new GameError(400, "التصنيف غير موجود");
  if (!name.trim()) throw new GameError(400, "اكتب اسمك");
  const { room, player } = createRoom(name.trim(), category);
  res.status(201).json(CreateRoomResponse.parse({ token: player.token, room: roomState(room, player) }));
}));
router.post("/rooms/:code/join", handle((req, res) => {
  const { code } = parse(JoinRoomParams, req.params);
  const { name } = parse(JoinRoomBody, req.body);
  if (!name.trim()) throw new GameError(400, "اكتب اسمك");
  const room = lookup(code);
  const player = joinRoom(room, name.trim());
  res.json(JoinRoomResponse.parse({ token: player.token, room: roomState(room, player) }));
}));
router.get("/rooms/:code", handle((req, res) => {
  const { code } = parse(GetRoomParams, req.params);
  const { token } = parse(GetRoomQueryParams, req.query);
  const room = lookup(code);
  res.json(GetRoomResponse.parse(roomState(room, authorized(room, token))));
}));
router.post("/rooms/:code/start", handle((req, res) => {
  const { code } = parse(StartRoundParams, req.params);
  const { token } = parse(StartRoundBody, req.body);
  const room = lookup(code);
  startRound(room, authorized(room, token));
  res.json(StartRoundResponse.parse(roomState(room, authorized(room, token))));
}));
router.post("/rooms/:code/clues", handle((req, res) => {
  const { code } = parse(SubmitClueParams, req.params);
  const { token, text } = parse(SubmitClueBody, req.body);
  if (!text.trim()) throw new GameError(400, "اكتب تلميحاً");
  const room = lookup(code);
  const player = authorized(room, token);
  submitClue(room, player, text.trim());
  res.json(SubmitClueResponse.parse(roomState(room, player)));
}));
router.post("/rooms/:code/votes", handle((req, res) => {
  const { code } = parse(SubmitVoteParams, req.params);
  const { token, playerId } = parse(SubmitVoteBody, req.body);
  const room = lookup(code);
  const player = authorized(room, token);
  submitVote(room, player, playerId);
  res.json(SubmitVoteResponse.parse(roomState(room, player)));
}));
router.post("/rooms/:code/messages", handle((req, res) => {
  const { code } = parse(SendMessageParams, req.params);
  const { token, text } = parse(SendMessageBody, req.body);
  if (!text.trim()) throw new GameError(400, "اكتب رسالة");
  const room = lookup(code);
  const player = authorized(room, token);
  addMessage(room, player, text.trim());
  res.json(SendMessageResponse.parse(roomState(room, player)));
}));
export default router;