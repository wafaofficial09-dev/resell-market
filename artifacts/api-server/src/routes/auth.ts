import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "admin_session";
const COOKIE_VALUE = "authenticated";

export function requireAdmin(req: any, res: any, next: any) {
  const cookies = (req as any).signedCookies || {};
  if (cookies[COOKIE_NAME] === COOKIE_VALUE) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.cookie(COOKIE_NAME, COOKIE_VALUE, {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ authenticated: true });
});

router.post("/auth/logout", (req, res): void => {
  res.clearCookie(COOKIE_NAME);
  res.json({ authenticated: false });
});

router.get("/auth/me", (req, res): void => {
  const cookies = (req as any).signedCookies || {};
  if (cookies[COOKIE_NAME] === COOKIE_VALUE) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
