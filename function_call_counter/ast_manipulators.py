import ast

"""
This class imports functions that will be required during instrumentation
"""
class ModuleImporter(ast.NodeTransformer):

    def visit_Module(self, node: ast.Module) -> ast.Module:
        # from inspect import currentframe
        import_inspect = ast.ImportFrom(
            module='inspect',
            names=[
                ast.alias(name='currentframe', asname=None),
                ast.alias(name='getframeinfo', asname=None)
            ],
            level=0
        )
        node.body.insert(0, import_inspect)

        # from timeit import default_timer
        import_timeit = ast.ImportFrom(
            module='timeit',
            names=[
                ast.alias(name='default_timer')
            ],
            level=0
        )
        node.body.insert(0, import_timeit)

        return ast.fix_missing_locations(node)

"""
This class inserts statements into a function's body to keep track of 
function call and caller information 
"""
class FunctionInserter(ast.NodeTransformer):
    # inserts a call to get_func_call_info at the start of function definitions
    def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.FunctionDef:
        # func
        func = ast.Name(id=node.name, ctx=ast.Load())

        # __current_frame__ = currentframe()
        __current_frame__ = ast.Assign(
            targets=[ast.Name(id="__current_frame__", ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id="currentframe", ctx=ast.Load()),
                args=[],
                keywords=[]
            )
        )
        node.body.insert(0, __current_frame__)

        # __current_func_call__ = get_callee_function_call_string(func, __current_frame__)
        __current_func_call__ = ast.Assign(
            targets=[ast.Name(id="__current_func_call__", ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id="get_function_call_string", ctx=ast.Load()),
                args=[
                    func,
                    ast.Name(id="__current_frame__", ctx=ast.Load())
                ],
                keywords=[]
            )
        )
        node.body.insert(1, __current_func_call__)

        # __caller_frame__ = currentframe().f_back
        __caller_frame__ = ast.Assign(
            targets=[ast.Name(id="__caller_frame__", ctx=ast.Store())],
            value=ast.Attribute(
                value=ast.Call(
                    func=ast.Name(id='currentframe', ctx=ast.Load()),
                    args=[],
                    keywords=[]
                ),
                attr='f_back',
                ctx=ast.Load()
            )
        )
        node.body.insert(2, __caller_frame__)

        # __caller_frame_info__ = getframeinfo(__caller_frame__)
        __caller_frame_info__ = ast.Assign(
            targets=[ast.Name(id='__caller_frame_info__', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id='getframeinfo', ctx=ast.Load()),
                args=[ast.Name(id='__caller_frame__', ctx=ast.Load())],
                keywords=[]
            )
        )
        node.body.insert(3, __caller_frame_info__)

        # __caller_func_call__ = get_caller_function_call_string(__caller_frame__)
        __caller_func_call__ = ast.Assign(
            targets=[ast.Name(id='__caller_func_call__', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id='get_caller_function_call_string', ctx=ast.Load()),
                args=[
                    ast.Name(id='__caller_frame__', ctx=ast.Load())
                ],
                keywords=[]
            )
        )
        node.body.insert(4, __caller_func_call__)

        return ast.fix_missing_locations(node)

"""
This class is used to transform return statements so that the return value is saved and
the function call information is recorded in the output of the instrumentation
"""
class ReturnModifier(ast.NodeTransformer):
    def visit_Return(self, node: ast.Return) -> list:
        # do nothing for an empty return statement
        if node.value is None:
            return node

        # __ret_val__ = <return_expression>
        __ret_val__ = ast.Assign(
            targets=[
                ast.Name(id="__ret_val__", ctx=ast.Store())
            ],
            value=node.value
        )

        # __end_timer__ = default_timer()
        __end_timer__ = ast.Assign(
            targets=[ast.Name(id="__end_timer__", ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id="default_timer", ctx=ast.Load()),
                args=[],
                keywords=[]
            )
        )

        # record_func_call(__current_func_call__, __caller_func_call__, __caller_frame_info__, __ret_val__)
        record_func_call = ast.Expr(
            value=ast.Call(
                func=ast.Name(id='record_func_call', ctx=ast.Load()),
                args=[
                    ast.Name(id='__current_func_call__', ctx=ast.Load()),
                    ast.Name(id='__caller_func_call__', ctx=ast.Load()),
                    ast.Name(id='__caller_frame_info__', ctx=ast.Load()),
                    ast.Name(id='__ret_val__', ctx=ast.Load()),
                    ast.Name(id='__start_timer__', ctx=ast.Load()),
                    ast.Name(id='__end_timer__', ctx=ast.Load())
                ],
                keywords=[]
            )
        )

        # return __ret_val__
        return_stmt = ast.Return(
            value=ast.Name(id="__ret_val__", ctx=ast.Load())
        )

        return [__ret_val__, __end_timer__, record_func_call, return_stmt]

class ReturnAdder(ast.NodeTransformer):
    returnUID = None

    def __init__(self, returnUID) -> None:
        super().__init__()
        self.returnUID = returnUID

    def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.FunctionDef:
        # Check if return is present on LVL 1 depth of function def
        returnPres = False
        for i in node.body:
            if type(i) == ast.Return:
                returnPres = True
                break
        
        if not returnPres:
            dummyReturn = ast.Return(
                value = ast.Constant(value=self.returnUID)
            )
            node.body.append(dummyReturn)

        return ast.fix_missing_locations(node)