import axiosBase from "axios";
import {
  MembershipProver,
  Poseidon,
  defaultPubkeyMembershipPConfig,
  MerkleProof
} from "@personaelabs/spartan-ecdsa";
import {
  ecrecover,
  ecsign,
  hashPersonalMessage,
  pubToAddress
} from "@ethereumjs/util";

const axios = axiosBase.create({
  baseURL: `http://localhost:3000/api/v1`
});

const privKey = Buffer.from("".padStart(16, "🧙"), "utf16le");

type Member = {
  pubkey: string,
  path: string[],
  indices: number[]
}

// Content the user signs when creating a post
type PostContentData = {
  title: string,
  body: string,
  parentId?: string,
  timestamp: number,
  venue: string
}

const venue = "nouns";

const hashPostContentData = (contentData: PostContentData) => {
  const msgHash = hashPersonalMessage(
    Buffer.from(
      JSON.stringify({
        title: contentData.title,
        body: contentData.body,
        parentId: contentData.parentId,
        timestamp: contentData.timestamp,
        venue: contentData.venue
      }),
      "utf8"
    )
  );

  return msgHash;
}

export default function Example() {
  const postDoxed = async () => {
    const title = "doxed post title";
    const body = `doxed post body ${Math.random()}`;
    // @ts-ignore
    const parentId = document.getElementById("doxedPostParentId")?.value;

    const timestamp = Math.round(Date.now() / 1000);

    const msgHash = hashPostContentData({
      title,
      body,
      timestamp,
      parentId,
      venue
    });

    const { r, v, s } = ecsign(msgHash, privKey);
    const sig = `${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;
    const result = await axios.post(`/posts`, {
      body,
      sig,
      title,
      parentId,
      timestamp,
      venue
    });

    console.log("Created a non-pseudonymous post! postId", result.data.postId);
  };

  const postPseudo = async () => {
    const title = "pseudo post title";
    const body = `pseudo post body ${Math.random()}`;
    // @ts-ignore
    const parentId = document.getElementById("pseudoPostParentId")?.value;

    const timestamp = Math.round(Date.now() / 1000);

    const msgHash = hashPostContentData({
      title,
      body,
      timestamp,
      parentId,
      venue
    });

    const { v, r, s } = ecsign(msgHash, privKey);
    const pubKey = ecrecover(msgHash, v, r, s);
    const sig = `0x${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;

    const poseidon = new Poseidon();
    await poseidon.initWasm();

    const {
      data
    } = await axios.get("/groups/latest?set=2");
    const root: string = data.root;
    const members: Member[] = data.members;

    const proverPubKey = pubKey.toString("hex");
    
    const proverInSet = members.find((member) => member.pubkey === proverPubKey);

    if (!proverInSet) {
      throw new Error("Prover not found in set");
    }

    const merkleProof: MerkleProof = {
      pathIndices: proverInSet?.indices,
      siblings: proverInSet?.path.map((sibling) => BigInt("0x" + sibling)),
      root: BigInt("0x" + root)
    }

    const prover = new MembershipProver({
      ...defaultPubkeyMembershipPConfig,
      enableProfiler: true
    });

    await prover.initWasm();

    const { proof, publicInput } = await prover.prove(
      sig,
      msgHash,
      merkleProof
    );

    const result = await axios.post(
      `posts`,
      {
        title,
        body,
        parentId,
        timestamp,
        venue,
        proof: Buffer.from(proof).toString("hex"),
        publicInput: Buffer.from(publicInput.serialize()).toString("hex")
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Created a pseudonymous post! postId", result.data.postId);
  };

  const upvote = async () => {
    // @ts-ignore
    const postId = document.getElementById("upvotePostId")?.value;
    const timestamp = Math.round(Date.now() / 1000);
    const msgHash = hashPersonalMessage(Buffer.from(JSON.stringify({
      postId,
      timestamp
    }), "utf8"));

    const { r, v, s } = ecsign(msgHash, privKey);
    const pubKey = ecrecover(msgHash, v, r, s);
    const address = pubToAddress(pubKey).toString("hex");

    const sig = `${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;

    await axios.post(`/posts/${postId}/upvote`, { 
      sig,
      timestamp,
      address
     });
    console.log("Upvoted post", postId);
  };

  const getThread = async () => {
    // @ts-ignore
    const postId = document.getElementById("postId")?.value;
    const { data: thread } = await axios.get(`/posts/${postId}`);
    console.log("Thread starting from post:", postId);
    console.log(thread);
  };

  return (
    <div>
      <div>
        <button onClick={postDoxed}>Doxed post</button>
        <input
          type="text"
          id="doxedPostParentId"
          placeholder="parentId (optional)"
        />
      </div>
      <div>
        <button onClick={postPseudo}>Pseudo post</button>
        <input
          type="text"
          id="pseudoPostParentId"
          placeholder="parentId (optional)"
        />
      </div>
      <div>
        <button onClick={upvote}>upvote</button>
        <input type="text" id="upvotePostId" placeholder="postId" />
      </div>
      <div>
        <button onClick={getThread}>getThread</button>
        <input type="text" id="postId" placeholder="postId"></input>
      </div>
    </div>
  );
}
