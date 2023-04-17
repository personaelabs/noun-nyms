import axiosBase from "axios";
import {
  MembershipProver,
  Tree,
  Poseidon,
  defaultPubkeyMembershipPConfig
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

export default function Example() {
  const postDoxed = async () => {
    const title = "doxed post title";
    const content = `doxed post content ${Math.random()}`;
    // @ts-ignore
    const parentId = document.getElementById("doxedPostParentId")?.value;

    const msgHash = hashPersonalMessage(
      Buffer.from(
        JSON.stringify({
          content,
          title,
          parentId
        }),
        "utf8"
      )
    );

    const { r, v, s } = ecsign(msgHash, privKey);
    const sig = `${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;
    const result = await axios.post(`/posts`, {
      content,
      sig,
      title,
      parentId
    });

    console.log("postId", result.data.postId);
  };

  const postPseudo = async () => {
    const title = "pseudo post title";
    const content = `pseudo post content ${Math.random()}`;
    // @ts-ignore
    const parentId = document.getElementById("pseudoPostParentId")?.value;

    const msgHash = hashPersonalMessage(
      Buffer.from(
        JSON.stringify({
          content,
          title,
          parentId
        }),
        "utf8"
      )
    );

    const { v, r, s } = ecsign(msgHash, privKey);
    const pubKey = ecrecover(msgHash, v, r, s);
    console.log(pubToAddress(pubKey).toString("hex"));
    const sig = `0x${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;

    const poseidon = new Poseidon();
    await poseidon.initWasm();

    const treeDepth = 20;
    const pubKeyTree = new Tree(treeDepth, poseidon);

    const {
      data: { members, root }
    } = await axios.get("/groups/latest?set=2");

    const proverPubKeyHash = poseidon.hashPubKey(pubKey);

    for (let i = 0; i < members.length; i++) {
      pubKeyTree.insert(poseidon.hashPubKey(Buffer.from(members[i], "hex")));
    }

    if (root !== pubKeyTree.root().toString(16)) {
      throw new Error("Roots don't match");
    }

    const index = pubKeyTree.indexOf(proverPubKeyHash);
    const merkleProof = pubKeyTree.createProof(index);

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
        content,
        parentId,
        proof: Buffer.from(proof).toString("hex"),
        publicInput: Buffer.from(publicInput.serialize()).toString("hex")
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("postId", result.data.postId);
  };

  const upvote = async () => {
    // @ts-ignore
    const postId = document.getElementById("upvotePostId")?.value;
    const msg = Buffer.from(postId.toString());
    const msgHash = hashPersonalMessage(msg);
    const { r, v, s } = ecsign(msgHash, privKey);

    const sig = `${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`;

    const result = await axios.post(`/posts/${postId}/upvote`, { sig });
    console.log(result);
  };

  const getThread = async () => {
    // @ts-ignore
    const postId = document.getElementById("postId")?.value;
    const { data: thread } = await axios.get(`/posts/${postId}`);
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
