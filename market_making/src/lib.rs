

pub mod types;

use std::iter::Iterator;
use num_traits::ops::checked::{CheckedAdd, CheckedMul, CheckedDiv}; 
use num_traits::{Float, FromPrimitive};
use std::ascii::AsciiExt;
use ark_std::iterable::Iterable;