# Context-aware grep

This is a simple regex match CLI that includes all lines leading up to a match
that have a lower indentation than the match itself. It has far fewer features
than GNU grep. In fact, it's usage is very simple:

```bash
cat file | ctxgrep expression
```

or

```bash
ctxgrep expression [filename|-]
```

where `-` causes `ctxgrep` to read from `stdin`.

## Example

Which dependencies of [apollo-server][] match the expression `graphql`?
`yarn list` would tell us, but would not filter. `grep` would filter, but would
not tell us the path down the dependency tree that causes the dependency. So,
we replace the box drawing characters that `yarn list` outputs with spaces, so
we can properly count indentation, and filter with `ctxgrep`. This tells us not
only which dependencies match `graphql`, but also the branch of the tree that
causes the dependency.

```bash
$ yarn list | sed 's/[│ ├─└]/ /g' | ctxgrep graphql
stdin:     1:yarn list v1.22.19
stdin:     5:   @apollo/federation@0.15.0-alpha.0
stdin:     6:      apollo-graphql@^0.4.0
stdin:    10:   @apollo/gateway@0.15.0-alpha.0
stdin:    22:      apollo-graphql@^0.4.0
stdin:    49:      graphql-extensions@file:packages/graphql-extensions
stdin:   101:   @apollographql/apollo-tools@0.4.5
stdin:   103:   @apollographql/graphql-playground-html@1.6.24
stdin:   967:   @types/graphql-upload@8.0.12
stdin:   972:      graphql@0.13.1 - 16
stdin:   973:      graphql@16.8.1
stdin:  1180:   apollo-cache-control@0.10.0-alpha.0
stdin:  1182:      graphql-extensions@file:packages/graphql-extensions
stdin:  1194:   apollo-engine-reporting@1.8.0-alpha.0
stdin:  1196:      apollo-graphql@^0.4.0
stdin:  1202:      graphql-extensions@file:packages/graphql-extensions
stdin:  1226:   apollo-graphql@0.4.5
stdin:  1245:   apollo-server-azure-functions@2.13.0-alpha.0
stdin:  1246:      @apollographql/graphql-playground-html@1.6.24
stdin:  1251:      graphql-tools@^4.0.0
stdin:  1252:      graphql-tools@4.0.8
stdin:  1285:   apollo-server-cloud-functions@2.13.0-alpha.0
stdin:  1286:      @apollographql/graphql-playground-html@1.6.24
stdin:  1290:      graphql-tools@^4.0.0
stdin:  1291:      graphql-tools@4.0.8
stdin:  1301:   apollo-server-core@2.13.0-alpha.0
stdin:  1302:      @apollographql/apollo-tools@^0.4.3
stdin:  1303:      @apollographql/apollo-tools@0.4.14
stdin:  1305:      @apollographql/graphql-playground-html@1.6.24
stdin:  1306:      @types/graphql-upload@^8.0.0
stdin:  1332:      graphql-extensions@file:packages/graphql-extensions
stdin:  1333:      graphql-tag@^2.9.2
stdin:  1334:      graphql-tag@2.12.6
stdin:  1336:      graphql-tools@^4.0.0
stdin:  1337:      graphql-tools@4.0.8
stdin:  1343:      graphql-upload@^8.0.2
stdin:  1376:   apollo-server-express@2.13.0-alpha.0
stdin:  1377:      @apollographql/graphql-playground-html@1.6.24
stdin:  1473:      graphql-subscriptions@^1.0.0
stdin:  1474:      graphql-subscriptions@1.2.1
stdin:  1476:      graphql-tools@^4.0.0
stdin:  1477:      graphql-tools@4.0.8
stdin:  1516:   apollo-server-fastify@2.13.0-alpha.0
stdin:  1517:      @apollographql/graphql-playground-html@1.6.24
stdin:  1522:      graphql-subscriptions@^1.0.0
stdin:  1523:      graphql-subscriptions@1.2.1
stdin:  1525:      graphql-tools@^4.0.0
stdin:  1526:      graphql-tools@4.0.8
stdin:  1532:   apollo-server-hapi@2.13.0-alpha.0
stdin:  1533:      @apollographql/graphql-playground-html@1.6.24
stdin:  1538:      graphql-subscriptions@^1.0.0
stdin:  1539:      graphql-subscriptions@1.2.1
stdin:  1541:      graphql-tools@^4.0.0
stdin:  1542:      graphql-tools@4.0.8
stdin:  1551:   apollo-server-koa@2.13.0-alpha.0
stdin:  1552:      @apollographql/graphql-playground-html@1.6.24
stdin:  1563:      graphql-subscriptions@^1.0.0
stdin:  1564:      graphql-subscriptions@1.2.1
stdin:  1566:      graphql-tools@^4.0.0
stdin:  1567:      graphql-tools@4.0.8
stdin:  1579:   apollo-server-lambda@2.13.0-alpha.0
stdin:  1580:      @apollographql/graphql-playground-html@1.6.24
stdin:  1586:      graphql-tools@^4.0.0
stdin:  1587:      graphql-tools@4.0.8
stdin:  1593:   apollo-server-micro@2.13.0-alpha.0
stdin:  1594:      @apollographql/graphql-playground-html@1.6.24
stdin:  1611:   apollo-server@2.13.0-alpha.0
stdin:  1670:      graphql-subscriptions@^1.0.0
stdin:  1671:      graphql-subscriptions@1.2.1
stdin:  1673:      graphql-tools@^4.0.0
stdin:  1674:      graphql-tools@4.0.8
stdin:  1708:   apollo-tracing@0.10.0-alpha.0
stdin:  1710:      graphql-extensions@file:packages/graphql-extensions
stdin:  2852:   graphql-extensions@0.12.0-alpha.0
stdin:  2853:      @apollographql/apollo-tools@^0.4.3
stdin:  2854:      @apollographql/apollo-tools@0.4.14
stdin:  2879:   graphql-subscriptions@1.1.0
stdin:  2881:   graphql-tag@2.10.3
stdin:  2882:   graphql-tools@4.0.7
stdin:  2888:   graphql-upload@8.1.0
stdin:  2901:   graphql@14.6.0
```

It's also useful for grepping code, because, for a given variable name, it will
tell you the if-statement in which it is read/written, all the way up to the
name of the function wherein the if-statement appears. Since it calculates
context from the initial indentation and nothing more, it does not track
multiline function definitions. So, a function definition like

```c
int main(
  int argc,
  char **argv
) {
  int variable_name = 0;
}
```

would only show

```
) {
  int variable_name = 0;
```

[apollo-server]: https://www.npmjs.com/package/apollo-server
