use anchor_lang::prelude::*;

use crate::create_user_account::SolanaTwitterAccountInfo;

pub fn modify_user_account(
    ctx: Context<ModifyUserAccount>,
    handle: String,
    display_name: String,
    _twitter_account_bump: u8,
) -> Result<()> {
    msg!("Modifying Solana Twitter account...");

    // TODO: Modify Twitter Account

    msg!("Solana Twitter account updated successfully.");
    Ok(())
}

#[derive(Accounts)]

pub struct ModifyUserAccount<'info> {
    // TODO: Modify Twitter Account Context
}
