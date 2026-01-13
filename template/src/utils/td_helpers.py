"""
TouchDesigner helper utilities for Nyan.

These functions are designed to be imported into TD via Execute DAT
or referenced from Script DATs.
"""

from __future__ import annotations

# Type hint placeholders for TD objects (pyright: ignore outside TD)
try:
    from _stubs import OP, PAR  # noqa: F401
except ImportError:
    OP = object
    PAR = object


def connect_chain(operators: list[str], parent_op: OP | None = None) -> None:
    """Connect a list of operators in sequence.

    Args:
        operators: List of operator names/paths to connect
        parent_op: Parent operator context (defaults to current)
    """
    # In TD context, 'op' and 'parent' are globally available
    # This is a reference implementation
    pass


def set_pars(operator: str, **kwargs) -> None:
    """Set multiple parameters on an operator.

    Args:
        operator: Operator name/path
        **kwargs: Parameter name=value pairs

    Example:
        set_pars('noise1', roughness=0.5, period=2.0)
    """
    pass


def create_feedback_loop(
    name: str,
    source_op: str,
    feedback_amount: float = 0.95,
) -> str:
    """Create a standard feedback loop network.

    Args:
        name: Base name for created operators
        source_op: Input operator path
        feedback_amount: Feedback mix amount (0-1)

    Returns:
        Path to the output operator
    """
    # Template for feedback loop creation
    # Actual TD calls would be:
    # comp = parent().create(feedbackTOP, f'{name}_feedback')
    # level = parent().create(levelTOP, f'{name}_level')
    # etc.
    pass
