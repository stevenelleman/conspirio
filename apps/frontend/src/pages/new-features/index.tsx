import AppLayout from "@/layouts/AppLayout";
import { storage } from "@/lib/storage";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ToggleableBanner } from "@/components/cards/ToggleableBanner";
import { SUPPORT_CONTACT } from "@/constants";

export default function NewFeaturesPage() {
  const router = useRouter();

  useEffect(() => {
    const gateUser = async () => {
      // Gate off for users that are not logged in and don't have an unregistered user
      const user = await storage.getUser();
      const unregisteredUser = await storage.getUnregisteredUser();
      if (!user && !unregisteredUser) {
        router.push("/");
        return;
      }
    };

    gateUser();
  }, [router]);

  return (
    <AppLayout
      seoTitle="New Features and Research Domains"
      header={
        <>
          <span className="text-label-primary font-medium">
            New Features and Research Domains
          </span>
          <div
            className="absolute left-0 right-0 bottom-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
            }}
          ></div>
        </>
      }
      withContainer={false}
    >
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex flex-col gap-4">
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about vocabulary of connection.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>A Vocabulary of Connection</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Commonality breeds fellowship. Complementarity breeds attraction, where sum is greater than its parts. Contrast is a mirror, a default behavior may be invisible in isolation and require a point of reference to become visible. By understanding what kinds of connection exist and having a variety of cryptographic primitives that offer strong safety guarantees without sacrificing expressivity at our disposal, what if we could create a new vocabulary of connection?
              </div>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about privacy and social friction reduction.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Privacy and Social Friction Reduction</b>
                </div>
              </div>
            }
            description={
            <>
              <div className="text-sm">
                {`By and large, people do not care about privacy for its own sake. The sudden, enormous cost of nation states or corporations ruining your life from shared information are few and far between, and only the principled and paranoid factor it in. In contrast, privacy matters insofar as it reduces social friction. Privacy by default is a requirement of meaningful control of information, and control enables reduction of social friction.`}
              </div>
              <br/>
              <div className="text-sm">
                {`The day the parents join whatever social media "new hotness" their kids are using is the day their kids leave and it becomes "old and busted". Kids exit because they lack the control needed to prevent social friction with their parents. We are very carefully considering privacy applied to social friction, including meaningful ways it can address in-person frictions. For example, in-person rejection and bragging come with social friction, whereas selective information sharing can facilitate tasteful and relevant rejection and bragging. With this consideration in mind, reduction of social friction becomes a meaningful short-term incentive for durable long-term privacy.`}
              </div>
            </>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about novel cryptographic primitives.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Exploring New Cryptographic Primitives</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Lets apply novel cryptographic in isolation and combination to real connection problems, and allow people to discover the depth of their relationships with others.
              </div>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about non-fungible connection.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Non-Fungible Connection</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Every pairwise relationship between people is unique - they are all fundamentally non-interchangeable. If we had personal information available and cryptographic vocabulary of connection, we could safely unveil the depth of latent connection that already exists.
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about verifiable traits.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Verifiable Signals and Traits</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Using cryptography it is trivially easy to make the integrity and provenance of information verifiable and true. In a world where consensus reality is broken, cryptography is one way of creating a bottom-up objectivity where traits, signals, and claims can be true with strong guarantees, enabing us to broker a new consensus reality.
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about legibility and incentive design.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Legibility and Incentive Design</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`With a foundation of verifiably true signals, an infinite diversity of high-integrity signals can be created, and with them, new incentive systems and social "games" can be crafted, ultimately to shape individual and collective behaviors to specific ends.`}
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about moral algorithms.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Moral Algorithms</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`And built on top of layers of verifiable signals and incentives we can discover "moral algorithms" that ultimately unlock "races to the top", emergent dynamics that produce net positive outcomes and bring out the best in people.`}
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about community and the long game.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Turning Finite Games to Infinite Games</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`In anonymity there often is no cost to being an asshole; just think about drivers on the highway, they're menaces. In game theory there is a concept of "finite" and "infinite" games. In a "finite" game the players know that they will only play each other once, whereas in an "infinite" game they may continue to play each other. These two scenarios motivate completely distinct strategies. In a "finite" game, greedy, malicious behaviors oriented towards short-term benefits are encouraged, whereas in an "infinite" game malicious actors quickly are identified and punished for their behaviors, either overtly or through exclusion. One of the objectives of a vocabulary of connection is to enable actors to discover alignment of interests and degree of "embeddedness" in similar social networks. In effect, this turns an anonymous "finite" game into an embedded "infinite" game, and in doing so, helps promote prosocial behaviors, including (but not limited to) playing more long games with others.`}
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about digital pheromones.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Digital Pheromones</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                <div className="text-sm">
                  Multi-party computation enables <b>digital pheromones</b>, the
                  ability to coordinate in a p2p way using lightweight,
                  privacy-preserving signals.
                </div>
                <div className="text-sm">
                  This enables new forms of communication like{" "}
                  <b>narrowcasting</b>, where only people that satisfy specific
                  private, verifiable criteria will be able to decrypt your
                  message.
                </div>
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about circumventing the prisoner's dilemma.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>{`Circumventing the Prisoner's Dilemma`}</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`The Prisoner's Dilemma assumes an inability to communicate - the simplest way to undermine the Dilemma is to always provide channels to communicate, and therefore coordinate. The norm uses a variety of tactics to divide and conquer and force individuals into a multi-dimensional Prisoner's Dilemma. With our cryptographic vocabulary of connection, perhaps we can transform alienation and races to the bottom to solidarity and races to the top.`}
              </div>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about transitive connection.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Transitive Connection</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                After theres a fabric of pairwise depth of connection, inferences can be made about transitive connection, ie connection between friends. This is where the system really takes off: when you add a new connection, they can trivially discover connection with your N other connections, creating a multiplier effect through referrals.
              </div>
            }
            textCenter={false}
          />


          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about collective triangulation.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Collective Triangulation</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                After theres a fabric of pairwise depth of connection, some spooky properties emerge. One such property is collective triangulation, where N connections have a much greater ability to triangulate on the objectivity of certain kinds of situations. One goal of Conspirio is to create the necessary conditions and vocabularies to experiment, understand, and refine collective triangulation.
              </div>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about embeddedness and the power of graphs.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Embeddedness and the Power of Graphs</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Technologies embedded in social, physical, and embodied systems can leverage deep, rich context, which has its own unique network effects. These network effects emerge out of the nature of graphs; to leverage this nature its vital to incentivize deep connection at all levels, rather than disconnection and alienation.
              </div>
            }
            textCenter={false}
          />

          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about common knowledge.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Discoverable Common Knowledge</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`Common knowledge is when "everyone knows that everyone knows". It is critical to create consensus, it provides a collective assurance that everyone is on the same page. In the alienated norm many "emperor wears no clothes" dynamics exist where the superficial appearance of a prevailing consensus shuts down the formation of a better consensus. The same vocabulary of connection can be used to de-risk sharing initially fringe opinions that are in fact becoming the new norm, and accelerating that process.`}
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about personas and faceted identity.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Personas and Faceted Identity</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                Identity implies a specific audience. Who we are with our friends is different than our colleagues or our family. A vocabulary of connection would allow these personas to be applied in the correct social contexts and continually extended. A world of personas is one of faceted identity, where different contexts reveal different expressions of otherwise latent behaviors, interests, and capabilities.
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about serendipity engineering and spontaneous coordination.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Serendipity Engineering and Spontaneous Coordination</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                When time, location, action dimensions are added to connection, serendipity is a natural byproduct, and serendipity at scale coalesces into spontaneous group coordination.
              </div>
            }
            textCenter={false}
          />
          <ToggleableBanner
            italic={false}
            buttonHref={`${SUPPORT_CONTACT}?text=Lets talk about cycle detection.`}
            title={
              <div className="!font-normal flex flex-col gap-4">
                <div className="text-md">
                  <b>Safe Cycle Detection</b>
                </div>
              </div>
            }
            description={
              <div className="text-sm">
                {`A whole class of coordination problem is "supply lock-in problems" where there may be latent desire for supply to change hands, but the inability to coordinate leads to stagnation and accidental entrenchment. In theory this class of problem could be solved if exchange could be safely discovered and executed, allowing locked-in supply to "re-animate" and re-enter circulation.`}
              </div>
            }
            textCenter={false}
          />
        </div>
      </div>
    </AppLayout>
  );
}
