import React from 'react';
import { useParams } from 'react-router-dom';
import UserProfile from '../../components/users/UserProfile/UserProfile';
import styles from './Users.module.css';

const UserDetails = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <UserProfile userId={id} />
    </div>
  );
};

export default UserDetails;
