import ast
from ast_manipulators import ModuleImporter, FunctionInserter, ReturnModifier
from inspect import getsource
import importlib


"""
Class to insert timeit at the beginning of function definition
"""
class StartTimerInserter(ast.NodeTransformer):
    def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.FunctionDef:
        # __start_timer__ = timeit.default_timer()
        __start_timer__ = ast.Assign(
            targets=[ast.Name(id="__start_timer__", ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id="default_timer", ctx=ast.Load()),
                args=[],
                keywords=[]
            )
        )
        node.body.insert(0, __start_timer__)

        return ast.fix_missing_locations(node)


# if __name__ == "__main__":
#     module_to_analyse = importlib.import_module("test_module")
#     source_code = getsource(module_to_analyse)

#     tree = ast.parse(source_code)
#     StartTimerInserter().visit(tree)