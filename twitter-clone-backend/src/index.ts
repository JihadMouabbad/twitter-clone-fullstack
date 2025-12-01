import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

// 1. Middleware (Darouri bach Frontend yhder m3a Backend)
app.use(express.json());
app.use(cors());

// 2. Route: Login / Inscription (FIXED)
// Hada kigol: "Ila kan user kayn, jibo. Ila makanx, crea wahed jdid."
app.post('/users', async (req, res) => {
  try {
    const { username } = req.body;

    // N9elbo 3lih
    let user = await prisma.user.findUnique({
      where: { username }
    });

    // Ila mal9inahch, n-creawh
    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    // Nrej3o user (fih l-ID mohim)
    res.json(user);
  } catch (e) {
    console.error("Erreur User:", e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 3. Route: Poster un Tweet
app.post('/tweets', async (req, res) => {
  const { content, authorId } = req.body;

  if (!authorId) {
    return res.status(400).json({ error: "User ID manquant" });
  }

  try {
    const tweet = await prisma.tweet.create({
      data: { content, authorId },
    });
    res.json(tweet);
  } catch (e) {
    console.error("Erreur Tweet:", e);
    res.status(500).json({ error: "Impossible de tweeter" });
  }
});

// 4. Route: Lire les Tweets (Feed)
app.get('/tweets', async (req, res) => {
  try {
    const tweets = await prisma.tweet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        _count: { select: { likes: true } }
      }
    });
    res.json(tweets);
  } catch (e) {
    res.status(500).json({ error: "Erreur lecture tweets" });
  }
});

// 5. Route: Liker
app.post('/likes', async (req, res) => {
  const { userId, tweetId } = req.body;
  try {
    const like = await prisma.like.create({
      data: { userId, tweetId }
    });
    res.json(like);
  } catch (error) {
    res.status(400).json({ message: "Déjà liké ou erreur" });
  }
});

// Lancement
const PORT = 3001;
// src/index.ts

// ... (Routes 9dima)

// 1. Get Profile (M3a Followers count)
app.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        tweets: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { likes: true } } } },
        _count: { select: { followedBy: true, following: true } }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { res.status(500).json({ error: "Erreur" }); }
});

// 2. Follow / Unfollow System
app.post('/follow', async (req, res) => {
  const { followerId, followingId } = req.body;

  try {
    // Check wach deja mfollowih
    const existing = await prisma.follows.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existing) {
      // Ila kan deja mfollowih -> Unfollow
      await prisma.follows.delete({
        where: { followerId_followingId: { followerId, followingId } }
      });
      res.json({ status: "unfollowed" });
    } else {
      // Ila makanx -> Follow
      await prisma.follows.create({
        data: { followerId, followingId }
      });
      res.json({ status: "followed" });
    }
  } catch (e) { res.status(400).json({ error: "Action impossible" }); }
});
// src/index.ts

// ... routes précédentes ...

// 1. RETWEET
app.post('/retweet', async (req, res) => {
  const { userId, tweetId } = req.body;

  try {
    // On récupère le tweet original
    const originalTweet = await prisma.tweet.findUnique({ where: { id: tweetId } });
    if (!originalTweet) return res.status(404).json({ error: "Tweet introuvable" });

    // On crée un nouveau tweet qui copie le contenu mais marque isRetweet
    const retweet = await prisma.tweet.create({
      data: {
        content: originalTweet.content,
        authorId: userId,
        isRetweet: true,
        image: originalTweet.image // Si y'a une image
      }
    });
    res.json(retweet);
  } catch (e) {
    res.status(500).json({ error: "Erreur retweet" });
  }
});

// 2. RÉPONDRE (REPLY)
app.post('/reply', async (req, res) => {
  const { content, authorId, parentId } = req.body; // parentId est l'ID du tweet auquel on répond

  try {
    const reply = await prisma.tweet.create({
      data: {
        content,
        authorId,
        parentId // Prisma fait le lien tout seul
      }
    });
    res.json(reply);
  } catch (e) {
    res.status(500).json({ error: "Erreur réponse" });
  }
});

// src/index.ts

// ... routes

// GET Single Tweet + Replies
app.get('/tweets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tweet = await prisma.tweet.findUnique({
      where: { id },
      include: {
        author: true,
        _count: { select: { likes: true, replies: true } },
        replies: { // Jib l-ajwiba (commentaires)
          include: { author: true, _count: { select: { likes: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(tweet);
  } catch (e) { res.status(404).json({ error: "Tweet introuvable" }); }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
