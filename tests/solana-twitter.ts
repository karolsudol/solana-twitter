import * as anchor from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import { assert } from "chai";

describe("solana-twitter", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanaTwitter as anchor.Program<SolanaTwitter>;

  const testWallet = anchor.web3.Keypair.generate();

  let testSolanaTwitterPda: anchor.web3.PublicKey;
  let testSolanaTwitterPdaBump: number;

  it("Prepare a new user wallet for testing", async () => {
    // Airdrop to wallet
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        testWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );
    // console.log(`Test Wallet Pubkey: ${testWallet.publicKey}`);

    // Derive Solana Twitter account PDA
    [testSolanaTwitterPda, testSolanaTwitterPdaBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [testWallet.publicKey.toBuffer(), Buffer.from("_profile")],
        program.programId
      );
  });

  async function printTwitterAccountInfo(address: anchor.web3.PublicKey) {
    const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(
      address
    );
    console.log(`Solana Twitter Account: ${address}`);
    console.log(`Username: ${accountInfo.handle}`);
    console.log(`Display Name: ${accountInfo.displayName}`);
    console.log(`Belongs to: ${accountInfo.authority}`);
  }

  it("Shoud create new Solana Twitter account", async () => {
    const handle = "solana_master";
    const displayName = "The Solana Master";

    await program.methods
      .createUserAccount(handle, displayName)
      .accounts({
        twitterAccount: testSolanaTwitterPda,
        authority: testWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testWallet])
      .rpc();

    const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(
      testSolanaTwitterPda
    );
    assert.equal(accountInfo.handle, handle);
    assert.equal(accountInfo.displayName, displayName);

    // assert.equal(
    //   accountInfo.authority,
    //   program.account.solanaTwitterAccountInfo.provider.publicKey
    // );

    // await printTwitterAccountInfo(testSolanaTwitterPda);
  });

  async function updateTwitterAccount(handle: string, name: string) {
    await program.methods
      .modifyUserAccount(handle, name, testSolanaTwitterPdaBump)
      .accounts({
        twitterAccount: testSolanaTwitterPda,
        authority: testWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testWallet])
      .rpc();
  }
  it("Should Update Solana Twitter account's handle", async () => {
    // Fetch existing display name
    const existingDisplayName = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).displayName;

    const handle = "solana_master";

    const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(
      testSolanaTwitterPda
    );

    await updateTwitterAccount(handle, existingDisplayName);
    assert.equal(accountInfo.handle, handle);
    // await printTwitterAccountInfo(testSolanaTwitterPda);
  });
  it("Should Update Solana Twitter account's display name", async () => {
    // Fetch existing handle
    const existingUsername = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).handle;

    const displayName = "The Solana Beast";

    await updateTwitterAccount(existingUsername, displayName);

    const accountInfo = await program.account.solanaTwitterAccountInfo.fetch(
      testSolanaTwitterPda
    );

    assert.equal(accountInfo.displayName, displayName);

    // await printTwitterAccountInfo(testSolanaTwitterPda);
  });

  async function writeTweet(
    tweetPdaAddress: anchor.web3.PublicKey,
    body: string
  ) {
    await program.methods
      .writeTweet(body, testSolanaTwitterPdaBump)
      .accounts({
        tweet: tweetPdaAddress,
        twitterAccount: testSolanaTwitterPda,
        authority: testWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testWallet])
      .rpc();
  }

  async function printTweet(address: anchor.web3.PublicKey) {
    const tweetAccountInfo = await program.account.solanaTweet.fetch(address);
    const twitterAccountInfo =
      await program.account.solanaTwitterAccountInfo.fetch(
        tweetAccountInfo.twitterAccountPubkey
      );
    console.log(`Solana tweet: ${address}`);
    console.log(
      `   Solana Twitter Account: ${tweetAccountInfo.twitterAccountPubkey}`
    );
    console.log(`Username: ${twitterAccountInfo.handle}`);
    console.log(`Display Name: ${twitterAccountInfo.displayName}`);
    console.log(`Belongs to: ${twitterAccountInfo.authority}`);
    console.log(`Body: ${tweetAccountInfo.body}`);
  }

  it("should write new tweet", async () => {
    // Derive the tweet address
    const tweetCount_0 = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).tweetCount;

    assert.equal(tweetCount_0, 0);
    // console.log(`Tweet Count: ${tweetCount}`);

    const tweetPdaAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [
        testWallet.publicKey.toBuffer(),
        Buffer.from("_tweet_"),
        Buffer.from((tweetCount_0 + 1).toString()),
      ],
      program.programId
    )[0];

    const tweet = "Hello everybody";
    await writeTweet(tweetPdaAddress, tweet);

    const tweetCount_1 = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).tweetCount;
    assert.equal(tweetCount_1, 1);

    // assert.equal(tweetPdaAddress.toString(), tweet);

    // await printTweet(tweetPdaAddress);
  });
  it("should write another tweet", async () => {
    // Derive the tweet address
    const tweetCount_1 = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).tweetCount;

    const tweetPdaAddress = (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          testWallet.publicKey.toBuffer(),
          Buffer.from("_tweet_"),
          Buffer.from((tweetCount_1 + 1).toString()),
        ],
        program.programId
      )
    )[0];

    const tweet = "Shout out to all my followers";
    await writeTweet(tweetPdaAddress, tweet);
    // assert.equal(tweetPdaAddress, tweet);

    const tweetCount_2 = (
      await program.account.solanaTwitterAccountInfo.fetch(testSolanaTwitterPda)
    ).tweetCount;
    assert.equal(tweetCount_2, 2);

    // await printTweet(tweetPdaAddress);
  });

  it("Testing getProgramAccounts", async () => {
    const programAccounts = await program.account.solanaTweet.all();
    for (var pa of programAccounts) {
      console.log(pa);
      const twitterAccount =
        await program.account.solanaTwitterAccountInfo.fetch(
          pa.account.twitterAccountPubkey
        );
      // console.log(twitterAccount.handle);
      // console.log(twitterAccount.displayName);
      // console.log(pa.account.tweetNumber);
      // console.log(pa.account.body);
    }
  });
});
