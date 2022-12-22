# Analysis deep dive

## How do we decide if a function is already memoized or cached?

The biggest foretelling that a function is already memoized or cached is when one call to a signature takes significantly more time than other calls to the same signature. We used this as the driving information to determine whether a function is already memoized or not

Thus for each function signature, we calculated their `relative increase`:

$$\begin{align*}RI=\frac{\text{longest process time of signature}}{\text{average process time of signature}}\end{align*}$$

However, due to how computers work, even if a function is not cached or memoized in some way, the process times vary from call to call so the `relative increase` of each signature will also vary greatly.

In order to offset this we decided to use a Naive Bayes probabilistic model based on `relative increase` to determine whether or not the function is memoized or not:

Our goal is to compare the probability that a function is memoized given all of its signatures `relative increases` with the probability that it is not memoized given the same set of data:

$$\begin{align*}P(M|RI_1,RI_2,...,RI_n) &> P(!M|RI_1,RI_2,...RI_n)\end{align*}$$

Using Bayes rule we get:

$$\begin{align*}\frac{P(RI_1,RI_2,...,RI_n|M)P(M)}{P(RI_1,RI_2,...,RI_n)} &> \frac{P(RI_1,RI_2,...,RI_n|!M)P(!M)}{P(RI_1,RI_2,...,RI_n)} \end{align*}$$

We can ignore the denominator as they are shared leaving us with:

$$\begin{align*}P(RI_1,RI_2,...,RI_n|M)P(M)&> P(RI_1,RI_2,...,RI_n|!M)P(!M)\end{align*}$$

Since this is Naive Bayes, we assume conditional independence of all `relative increases`

meaning that we get:

$$\begin{align*}P(RI_1|M)P(RI_2|M)...P(RI_n|M)P(M) > P(RI_1|!M)P(RI_2|!M)...P(RI_n|!M)P(!M)\end{align*}$$

for our conditional distribution of $P(RI|M)$ we decided to go with a simple function:

$$P(RI|M)=min(1,1.5*ln(RI))$$

basically, the probability that $RI=1$ (meaning that all calls to a signature took the same amount of time) given that a function is memoized is 0 and the higher the $RI$ is then the higher the probability, which makes sense intuitively

For the conditional distribution of $P(RI|!M)$ we naively assumed that it is the complement to the value of $P(RI|M)$ as it made sense as well as seems to work fine

For the value of $P(M)$ we went with a base line saying of $P(M)=0.5$ as a good estimate

With all of this information, we can then calculate the wanted probabilities and then compare to see which one is higher, determining whether or not we think the function is memoized or not.

Because this is a probabilistic model as well as the volatility in process times, MemoFinder may not always correctly classify if the function you have is already memoized or not. So we suggest running the program multiple times to see what is the most common occurrence to decide your conclusion.

## How do we decide that a function needs memoization?

If a function is not already memoized, how do we determine if it would benefit from memiozation and or caching?

We use an internal metric called `memoization score` that we give to each signature:

$$\text{memoization score} = ln(1+\text{num instance}-\text{num unique return values})+(\text{avg time})^2$$

Here the log makes it so:

- if there is only 1 instance we have a `memoization score` of 0
- if all return values are unique then we have a `memoization score` of 0
- if there is a large number of instances, then it is probably a base case so temper its growth (i.e. `fib(1)` or `fib(0)` )

The square of the time makes it so:

- the magnitude of the time is exaggerated
- that functions with really short process times are recognized as not needing memoization

To find the overall `memoziation score` for an entire function, we take the max of the `memoization score` for all of its signatures

We then can then filter based on a threshold to determine whether or not a function truly requires memoization or not.