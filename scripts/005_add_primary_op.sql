-- Add Primary Op fields to games table
ALTER TABLE games 
ADD COLUMN player1_primary_op TEXT CHECK (player1_primary_op IN ('CritOp', 'TacOp', 'KillOp')),
ADD COLUMN player1_primary_op_score INTEGER CHECK (player1_primary_op_score >= 1 AND player1_primary_op_score <= 3),
ADD COLUMN player2_primary_op TEXT CHECK (player2_primary_op IN ('CritOp', 'TacOp', 'KillOp')),
ADD COLUMN player2_primary_op_score INTEGER CHECK (player2_primary_op_score >= 1 AND player2_primary_op_score <= 3);
