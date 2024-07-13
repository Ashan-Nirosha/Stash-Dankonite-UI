import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import * as GQL from "src/core/generated-graphql";
import NavUtils from "src/utils/navigation";
import TextUtils from "src/utils/text";
import { GridCard, calculateCardWidth } from "../Shared/GridCard/GridCard";
import { CountryFlag } from "../Shared/CountryFlag";
import { SweatDrops } from "../Shared/SweatDrops";
import { HoverPopover } from "../Shared/HoverPopover";
import { Icon } from "../Shared/Icon";
import { TagLink } from "../Shared/TagLink";
import { Button, ButtonGroup } from "react-bootstrap";
import {
  Criterion,
  CriterionValue,
} from "src/models/list-filter/criteria/criterion";
import { PopoverCountButton } from "../Shared/PopoverCountButton";
import GenderIcon from "./GenderIcon";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { RatingBanner } from "../Shared/RatingBanner";
import { usePerformerUpdate } from "src/core/StashService";
import { ILabeledId } from "src/models/list-filter/types";
import ScreenUtils from "src/utils/screen";
import { FavoriteIcon } from "../Shared/FavoriteIcon";
import { toLower } from "lodash-es";
import { Tilt } from "react-tilt";

export interface IPerformerCardExtraCriteria {
  scenes?: Criterion<CriterionValue>[];
  images?: Criterion<CriterionValue>[];
  galleries?: Criterion<CriterionValue>[];
  movies?: Criterion<CriterionValue>[];
  performer?: ILabeledId;
}

interface IPerformerCardProps {
  performer: GQL.PerformerDataFragment;
  containerWidth?: number;
  ageFromDate?: string;
  selecting?: boolean;
  selected?: boolean;
  onSelectedChanged?: (selected: boolean, shiftKey: boolean) => void;
  extraCriteria?: IPerformerCardExtraCriteria;
}

export const PerformerCard: React.FC<IPerformerCardProps> = ({
  performer,
  containerWidth,
  ageFromDate,
  selecting,
  selected,
  onSelectedChanged,
  extraCriteria,
}) => {
  const intl = useIntl();
  const defaultOptions = {
    reverse:        false,  // reverse the tilt direction
    max:            10,     // max tilt rotation (degrees)
    perspective:    1000,   // Transform perspective, the lower the more extreme the tilt gets.
    scale:          1.1,    // 2 = 200%, 1.5 = 150%, etc..
    speed:          100,   // Speed of the enter/exit transition
    transition:     true,   // Set a transition on enter/exit.
    axis:           null,   // What axis should be disabled. Can be X or Y.
    reset:          true,    // If the tilt effect has to be reset on exit.
    easing:         "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
  }
  const age = TextUtils.age(
    performer.birthdate,
    ageFromDate ?? performer.death_date
  );
  const ageL10nId = ageFromDate
    ? "media_info.performer_card.age_context"
    : "media_info.performer_card.age";
  const ageL10String = intl.formatMessage({
    id: "years_old",
    defaultMessage: "years old",
  });
  const ageString = intl.formatMessage(
    { id: ageL10nId },
    { age, years_old: ageL10String }
  );

  const [updatePerformer] = usePerformerUpdate();
  const [cardWidth, setCardWidth] = useState<number>();

  useEffect(() => {
    if (!containerWidth || ScreenUtils.isMobile()) return;

    let preferredCardWidth = 300;
    let fittedCardWidth = calculateCardWidth(
      containerWidth,
      preferredCardWidth!
    );
    setCardWidth(fittedCardWidth);
  }, [containerWidth]);

  function onToggleFavorite(v: boolean) {
    if (performer.id) {
      updatePerformer({
        variables: {
          input: {
            id: performer.id,
            favorite: v,
          },
        },
      });
    }
  }

  function maybeRenderScenesPopoverButton() {
    if (!performer.scene_count) return;

    return (
      <PopoverCountButton
        className="scene-count"
        type="scene"
        count={performer.scene_count}
        url={NavUtils.makePerformerScenesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.scenes
        )}
      />
    );
  }

  function maybeRenderImagesPopoverButton() {
    if (!performer.image_count) return;

    return (
      <PopoverCountButton
        className="image-count"
        type="image"
        count={performer.image_count}
        url={NavUtils.makePerformerImagesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.images
        )}
      />
    );
  }

  function maybeRenderGalleriesPopoverButton() {
    if (!performer.gallery_count) return;

    return (
      <PopoverCountButton
        className="gallery-count"
        type="gallery"
        count={performer.gallery_count}
        url={NavUtils.makePerformerGalleriesUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.galleries
        )}
      />
    );
  }

  function maybeRenderOCounter() {
    if (!performer.o_counter) return;

    return (
      <div className="o-counter">
        <Button className="minimal">
          <span className="fa-icon">
            <SweatDrops />
          </span>
          <span>{performer.o_counter}</span>
        </Button>
      </div>
    );
  }

  function maybeRenderTagPopoverButton() {
    if (performer.tags.length <= 0) return;

    const popoverContent = performer.tags.map((tag) => (
      <TagLink key={tag.id} linkType="performer" tag={tag} />
    ));

    return (
      <HoverPopover placement="bottom" content={popoverContent}>
        <Button className="minimal tag-count">
          <Icon icon={faTag} />
          <span>{performer.tags.length}</span>
        </Button>
      </HoverPopover>
    );
  }

  function maybeRenderGroupsPopoverButton() {
    if (!performer.movie_count) return;

    return (
      <PopoverCountButton
        className="group-count"
        type="group"
        count={performer.movie_count}
        url={NavUtils.makePerformerGroupsUrl(
          performer,
          extraCriteria?.performer,
          extraCriteria?.movies
        )}
      />
    );
  }

  function maybeRenderPopoverButtonGroup() {
    if (
      performer.scene_count ||
      performer.image_count ||
      performer.gallery_count ||
      performer.tags.length > 0 ||
      performer.o_counter ||
      performer.movie_count
    ) {
      return (
        <>
          <hr />
          <ButtonGroup className="card-popovers">
            {maybeRenderScenesPopoverButton()}
            {maybeRenderGroupsPopoverButton()}
            {maybeRenderImagesPopoverButton()}
            {maybeRenderGalleriesPopoverButton()}
            {maybeRenderTagPopoverButton()}
            {maybeRenderOCounter()}
          </ButtonGroup>
        </>
      );
    }
  }

  function maybeRenderRatingBanner() {
    if (!performer.rating100) {
      return;
    }
    return <RatingBanner rating={performer.rating100} />;
  }

  function maybeRenderFlag() {
    if (performer.country) {
      return (
        <Link to={NavUtils.makePerformersCountryUrl(performer)}>
          <CountryFlag
            className="performer-card__country-flag"
            country={performer.country}
            includeOverlay
          />
          <span className="performer-card__country-string">
            {performer.country}
          </span>
        </Link>
      );
    }
  }
  return (
    <Tilt options={defaultOptions} className="mt-4 mb-4 tiltythingy">
    <div className="performer-card">
      <a href={`/performers/${performer.id}`} className="d-flex flex-col pl-0">
        <div className="top">
          <div className="toptop">
            <div className="perfNameFloat">
              <span className="performer-name">{performer.name}</span>
                {performer.disambiguation && (
                  <span className="performer-disambiguation">
                    {` (${performer.disambiguation})`}
                  </span>
                )}
            </div>
            <FavoriteIcon
              favorite={performer.favorite}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
          <img
            loading="lazy"
            className="performer-card-image"
            alt={performer.name ?? ""}
            src={performer.image_path ?? ""}
          />
        </div>
        <div className="flex-grow-1"></div>
        <div className="bott d-flex flex-row">
          <div className="d-flex flex-col 1stCol">
            {age !== 0 ? (
                <div className="performer-card__age pl-3">{ageString}</div>
              ) : (
                ""
              )}
              {maybeRenderScenesPopoverButton()}
          </div>
          <div className="d-flex flex-col 2ndCol">
            {performer.gender ? (
                  <div className="performer-card__gender pl-3">{toLower(performer.gender)}</div>
                ) : (
                  ""
                )}
              {maybeRenderTagPopoverButton()}
          </div>
          <div className="d-flex flex-col 3rdCol">
            <div className="idk pl-3">
              uCntCdis
            </div>
            {maybeRenderFlag()}
          </div>
        </div>
      </a>
    </div>
    </Tilt>
  )
  // return (
  //   <GridCard
  //     className="performer-card"
  //     url={`/performers/${performer.id}`}
  //     width={cardWidth}
  //     pretitleIcon={
  //       <GenderIcon className="gender-icon" gender={performer.gender} />
  //     }
  //     title={
  //       <div>
  //         <span className="performer-name">{performer.name}</span>
  //         {performer.disambiguation && (
  //           <span className="performer-disambiguation">
  //             {` (${performer.disambiguation})`}
  //           </span>
  //         )}
  //       </div>
  //     }
  //     image={
  //       <>
  //         <img
  //           loading="lazy"
  //           className="performer-card-image"
  //           alt={performer.name ?? ""}
  //           src={performer.image_path ?? ""}
  //         />
  //       </>
  //     }
  //     overlays={
  //       <>
  //         <FavoriteIcon
  //           favorite={performer.favorite}
  //           onToggleFavorite={onToggleFavorite}
  //         />
  //         {maybeRenderRatingBanner()}
  //         {maybeRenderFlag()}
  //       </>
  //     }
  //     details={
  //       <>
  //         {age !== 0 ? (
  //           <div className="performer-card__age">{ageString}</div>
  //         ) : (
  //           ""
  //         )}
  //       </>
  //     }
  //     popovers={maybeRenderPopoverButtonGroup()}
  //     selected={selected}
  //     selecting={selecting}
  //     onSelectedChanged={onSelectedChanged}
  //   />
  // );
};
