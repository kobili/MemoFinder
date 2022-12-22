export const SERVER_URL = 'http://localhost:1234'
export const METHODOLOGY =
  '##### How do we decide if a function is already memoized or cached?\n' +
  '\n' +
  'The biggest foretelling that a function is already memoized or cached is when one call to a signature takes significantly more time than other calls to the same signature. We used this as the driving information to determine whether a function is already memoized or not\n' +
  '\n' +
  'Thus for each function signature, we calculated their `relative increase`:\n' +
  '\n' +
  '$$\n' +
  '\\begin{align*}RI=\\frac{\\text{longest process time of signature}}{\\text{average process time of signature}}\\end{align*}\n' +
  '$$\n' +
  '\n' +
  'However, due to how computers work, even if a function is not cached or memoized in some way, the process times vary from call to call so the `relative increase` of each signature will also vary greatly.\n' +
  '\n' +
  'In order to offset this we decided to use a Naive Bayes probabilistic model based on `relative increase` to determine whether or not the function is memoized or not:\n' +
  '\n' +
  'Our goal is to compare the probability that a function is memoized given all of its signatures `relative increases` with the probability that it is not memoized given the same set of data:\n' +
  '\n' +
  '$$\n' +
  '\\begin{align*}P(M|RI_1,RI_2,...,RI_n) &> P(!M|RI_1,RI_2,...RI_n)\\end{align*}\n' +
  '$$\n' +
  '\n' +
  'Using Bayes rule we get:\n' +
  '\n' +
  '$$\n' +
  '\\begin{align*}\\frac{P(RI_1,RI_2,...,RI_n|M)P(M)}{P(RI_1,RI_2,...,RI_n)} &> \\frac{P(RI_1,RI_2,...,RI_n|!M)P(!M)}{P(RI_1,RI_2,...,RI_n)} \\end{align*}\n' +
  '$$\n' +
  '\n' +
  'We can ignore the denominator as they are shared leaving us with:\n' +
  '\n' +
  '$$\n' +
  '\\begin{align*}P(RI_1,RI_2,...,RI_n|M)P(M)&> P(RI_1,RI_2,...,RI_n|!M)P(!M)\\end{align*}\n' +
  '$$\n' +
  '\n' +
  'Since this is Naive Bayes, we assume conditional independence of all `relative increases`\n' +
  '\n' +
  'meaning that we get:\n' +
  '\n' +
  '$$\n' +
  '\\begin{align*}P(RI_1|M)P(RI_2|M)...P(RI_n|M)P(M) > P(RI_1|!M)P(RI_2|!M)...P(RI_n|!M)P(!M)\\end{align*}\n' +
  '$$\n' +
  '\n' +
  'for our conditional distribution of $P(RI|M)$ we decided to go with a simple function:\n' +
  '\n' +
  '$$\n' +
  'P(RI|M)=min(1,1.5*ln(RI))\n' +
  '$$\n' +
  '\n' +
  'basically, the probability that $RI=1$ (meaning that all calls to a signature took the same amount of time) given that a function is memoized is 0 and the higher the $RI$ is then the higher the probability, which makes sense intuitively\n' +
  '\n' +
  'For the conditional distribution of $P(RI|!M)$ we naively assumed that it is the complement to the value of $P(RI|M)$ as it made sense as well as seems to work fine\n' +
  '\n' +
  'For the value of $P(M)$ we went with a base line saying of $P(M)=0.5$ as a good estimate\n' +
  '\n' +
  'With all of this information, we can then calculate the wanted probabilities and then compare to see which one is higher, determining whether or not we think the function is memoized or not.\n' +
  '\n' +
  'Because this is a probabilistic model as well as the volatility in process times, MemoFinder may not always correctly classify if the function you have is already memoized or not. So we suggest running the program multiple times to see what is the most common occurrence to decide your conclusion.\n' +
  '\n' +
  '##### How do we decide that a function needs memoization?\n' +
  '\n' +
  'If a function is not already memoized, how do we determine if it would benefit from memiozation and or caching?\n' +
  '\n' +
  'We use an internal metric called `memoization score` that we give to each signature:\n' +
  '\n' +
  '$$\n' +
  '\\text{memoization score} = ln(1+\\text{\\#instance-\\text{\\#unique return values}})+(\\text{avg time})^2 \n' +
  '$$\n' +
  '\n' +
  'Here the log makes it so:\n' +
  '\n' +
  '- if there is only 1 instance we have a `memoization score` of 0\n' +
  '- if all return values are unique then we have a `memoization score` of 0\n' +
  '- if there is a large number of instances, then it is probably a base case so temper its growth (i.e. `fib(1)` or `fib(0)` )\n' +
  '\n' +
  'The square of the time makes it so:\n' +
  '\n' +
  '- the magnitude of the time is exaggerated\n' +
  '- that functions with really short process times are recognized as not needing memoization\n' +
  '\n' +
  'To find the overall `memoziation score` for an entire function, we take the max of the `memoization score` for all of its signatures\n' +
  '\n' +
  'We then can then filter based on a threshold to determine whether or not a function truly requires memoization or not.\n'
