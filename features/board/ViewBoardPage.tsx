import {
  createCard,
  removeCard,
  useBoard,
  useBoardCards,
  useBoardSections,
} from "@/services/firebase/board";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { Plus, Settings } from "react-feather";
import style from "./ViewBoardPage.module.scss";
import classnames from "classnames";
import MainNavbar from "@/components/MainNavbar";

export default function ViewBoardPage(): JSX.Element {
  const router = useRouter();
  const board = useBoard(router.query.boardId as string);
  const sections = useBoardSections(router.query.boardId as string);
  const sectionCards = useBoardCards(router.query.boardId as string);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <MainNavbar />
      {board && sections ? (
        <>
          <div>
            <Container fluid className="my-3">
              <div className="border-bottom border-light pb-3 d-flex">
                <div className="flex-fill">
                  <h1>{board.title}</h1>
                  <div className="text-muted mb-3">{board.description}</div>
                </div>
                <div className="ml-3">
                  <Link href={`/${router.query.boardId}/settings`} passHref>
                    <Button variant="secondary">
                      <Settings size="16" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Container>
          </div>
          <div className={classnames(style.Viewport, "flex-fill")}>
            <div
              className={classnames(
                style.Container,
                style[`SectionCount${board.sectionCount}`],
                "mx-auto my-3"
              )}
            >
              <Container fluid>
                <Row>
                  {sections.map((section) => (
                    <Col key={section.id}>
                      <h2
                        className={classnames(
                          style.SectionTitle,
                          "h5 text-center mb-3"
                        )}
                      >
                        {section.title}
                      </h2>
                      <Button
                        type="button"
                        size="sm"
                        block
                        className="mb-3"
                        onClick={() => {
                          createCard({
                            boardId: board.id,
                            sectionId: section.id,
                          }).catch((error) => alert(error.message));
                        }}
                      >
                        <Plus size="16" />
                      </Button>
                      {(sectionCards?.[section.id] || []).map((card) => (
                        <div key={card.id} className="bg-light mb-3 py-5">
                          Hello world!
                          <Button
                            type="button"
                            onClick={() => {
                              removeCard(
                                board.id,
                                section.id,
                                card.id
                              ).catch((error) => alert(error.message));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          </div>
        </>
      ) : (
        <Spinner
          animation="border"
          className="d-block text-center mx-auto my-5"
        />
      )}
    </div>
  );
}
