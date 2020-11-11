import { GetStaticProps, NextPage } from "next";
import React from "react";

const HomePage: NextPage = () => {
  return (
    <form>
      <h1>Hello</h1>
      <p>Enter your name:</p>
      <input type="text" />
    </form>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default HomePage;
