import { Button, ButtonGroup } from "react-bootstrap";
import React from "react";
import { Link } from "react-router-dom";
import * as GQL from "src/core/generated-graphql";
import { NavUtils } from "src/utils";
import { FormattedMessage } from "react-intl";
import { Icon } from "../Shared";
import { GridCard } from "../Shared/GridCard";
import { PopoverCountButton } from "../Shared/PopoverCountButton";

interface IProps {
  tag: GQL.TagDataFragment;
  zoomIndex: number;
  selecting?: boolean;
  selected?: boolean;
  onSelectedChanged?: (selected: boolean, shiftKey: boolean) => void;
}

export const TagCard: React.FC<IProps> = ({
  tag,
  zoomIndex,
  selecting,
  selected,
  onSelectedChanged,
}) => {
  function maybeRenderParents() {
    if (tag.parents.length === 1) {
      const parent = tag.parents[0];
      return (
        <div className="tag-parent-tags">
          <FormattedMessage id="sub_tag_of" />
          &nbsp;
          <Link to={`/tags/${parent.id}`}>{parent.name}</Link>
        </div>
      );
    }

    if (tag.parents.length > 1) {
      return (
        <div className="tag-parent-tags">
          <FormattedMessage id="sub_tag_of" />
          &nbsp;
          <Link to={NavUtils.makeParentTagsUrl(tag)}>
            {tag.parents.length}&nbsp;
            <FormattedMessage
              id="countables.tags"
              values={{ count: tag.parents.length }}
            />
          </Link>
        </div>
      );
    }
  }

  function maybeRenderChildren() {
    if (tag.children.length > 1) {
      return (
        <div className="tag-sub-tags">
          <FormattedMessage id="parent_of" />
          &nbsp;
          <Link to={NavUtils.makeChildTagsUrl(tag)}>
            {tag.children.length}&nbsp;
            <FormattedMessage
              id="countables.tags"
              values={{ count: tag.children.length }}
            />
          </Link>
        </div>
      );
    }
  }

  function maybeRenderScenesPopoverButton() {
    if (!tag.scene_count) return;

    return (
      <PopoverCountButton
        type="scene"
        count={tag.scene_count}
        url={NavUtils.makeTagScenesUrl(tag)}
      />
    );
  }

  function maybeRenderSceneMarkersPopoverButton() {
    if (!tag.scene_marker_count) return;

    return (
      <Link to={NavUtils.makeTagSceneMarkersUrl(tag)}>
        <Button className="minimal">
          <Icon icon="map-marker-alt" />
          <span>{tag.scene_marker_count}</span>
        </Button>
      </Link>
    );
  }

  function maybeRenderImagesPopoverButton() {
    if (!tag.image_count) return;

    return (
      <PopoverCountButton
        type="image"
        count={tag.image_count}
        url={NavUtils.makeTagImagesUrl(tag)}
      />
    );
  }

  function maybeRenderGalleriesPopoverButton() {
    if (!tag.gallery_count) return;

    return (
      <PopoverCountButton
        type="gallery"
        count={tag.gallery_count}
        url={NavUtils.makeTagGalleriesUrl(tag)}
      />
    );
  }

  function maybeRenderPerformersPopoverButton() {
    if (!tag.performer_count) return;

    return (
      <Link to={NavUtils.makeTagPerformersUrl(tag)}>
        <Button className="minimal">
          <Icon icon="user" />
          <span>{tag.performer_count}</span>
        </Button>
      </Link>
    );
  }

  function maybeRenderPopoverButtonGroup() {
    if (tag) {
      return (
        <>
          <hr />
          <ButtonGroup className="card-popovers">
            {maybeRenderScenesPopoverButton()}
            {maybeRenderImagesPopoverButton()}
            {maybeRenderGalleriesPopoverButton()}
            {maybeRenderSceneMarkersPopoverButton()}
            {maybeRenderPerformersPopoverButton()}
          </ButtonGroup>
        </>
      );
    }
  }

  return (
    <GridCard
      className={`tag-card zoom-${zoomIndex}`}
      url={`/tags/${tag.id}`}
      title={tag.name ?? ""}
      linkClassName="tag-card-header"
      image={
        <img
          className="tag-card-image"
          alt={tag.name}
          src={tag.image_path ?? ""}
        />
      }
      details={
        <>
          {maybeRenderParents()}
          {maybeRenderChildren()}
          {maybeRenderPopoverButtonGroup()}
        </>
      }
      selected={selected}
      selecting={selecting}
      onSelectedChanged={onSelectedChanged}
    />
  );
};
