use anchor_lang::prelude::*;

use crate::create_user_account::SolanaTwitterAccountInfo;

pub fn write_tweet(
    ctx: Context<WriteTweet>,
    body: String,
    _twitter_account_bump: u8,
) -> Result<()> {
    msg!("Publishing new tweet...");

    // TODO: Create Tweet

    msg!("Tweet published successfully.");
    Ok(())
}

#[derive(Accounts)]

pub struct WriteTweet<'info> {
    // TODO: Create Tweet Context
}

#[account]
pub struct SolanaTweet {
    // TODO: Tweet Account Data
}
